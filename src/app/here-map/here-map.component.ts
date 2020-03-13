import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Inject
} from "@angular/core";

import { interval } from "rxjs";
import { RetrieveItineraryService } from "../services/retrieve-itinerary.service";

declare var H: any;

@Component({
  selector: "here-map",
  templateUrl: "./here-map.component.html",
  styleUrls: ["./here-map.component.css"]
})
export class HereMapComponent implements OnInit {
  @ViewChild("map", { static: true }) public mapElement: ElementRef;

  @Input()
  public lat: any;

  @Input()
  public lng: any;

  @Input()
  public width: any;

  @Input()
  public height: any;

  private platform: any;
  private map: any;
  private itinerary: JSON;

  private svgMarkup = `<div style="left: -15px; top: -20px;"><svg viewBox="0 0 60 55" width="30" height="30" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve">
<g>
    <g xmlns="http://www.w3.org/2000/svg">
        <path d="M45.5 0h-43v43h16.2l5.9 5 5.8-5h15.1z" stroke="darkgrey" stroke-width="3" fill="#{color}" />
      <text x="13" y="35" font-family="sans-serif" font-size="2.5em" style="fill: white; stroke: darkgrey; stroke-width: 5">#{index}</text>
      <text x="13" y="35" font-family="sans-serif" font-size="2.5em" style="fill: white;">#{index}</text>
    </g>
</g></svg></div>`;

  private dotMarkup = `<div style="left: -10px; top: -10px;"><svg height="20" width="20">
  <circle cx="10" cy="10" r="10" stroke="gray" stroke-width="3" fill="lightblue" />
</svg></div>`;

  public constructor(
    private retrieveItineraryService: RetrieveItineraryService
  ) {}

  public ngOnInit() {
    this.platform = new H.service.Platform({
      apikey: "ihXu9_Ip2mUkI3Jw3mbPwr-6ko7G1Xss8KzYcqVjk48"
    });
  }

  async ngAfterViewInit() {
    let pixelRatio = window.devicePixelRatio || 1;
    let defaultLayers = this.platform.createDefaultLayers({
      tileSize: pixelRatio === 1 ? 256 : 512,
      ppi: pixelRatio === 1 ? undefined : 320
    });

    window.addEventListener("resize", () => this.map.getViewPort().resize());

    this.map = new H.Map(
      this.mapElement.nativeElement,
      defaultLayers.vector.normal.map,
      { pixelRatio: pixelRatio }
    );

    var provider = this.map.getBaseLayer().getProvider();
    // Create the style object from the YAML configuration.
    // First argument is the style path and the second is the base URL to use for
    // resolving relative URLs in the style like textures, fonts.
    // all referenced resources relative to the base path https://js.api.here.com/v3/3.1/styles/omv.
    var style = new H.map.Style(
      "assets/style.yaml",
      "https://js.api.here.com/v3/3.1/styles/omv/"
    );
    // set the style on the existing layer
    provider.setStyle(style);

    var behavior = new H.mapevents.Behavior(
      new H.mapevents.MapEvents(this.map)
    );
    var ui = H.ui.UI.createDefault(this.map, defaultLayers);

    this.map.setCenter({ lat: this.lat, lng: this.lng });
    this.map.setZoom(14);

    let uuids = ["1001", "1002"];
    let _this = this;
    uuids.forEach(async function(uuid, i) {
      _this.itinerary = await _this.retrieveItineraryService.getItineraryByShipment(
        uuid
      );

      let color = _this.getColor();
      _this.drawRoute(_this.itinerary, i, color);
    });
  }

  private getColor() {
    return (
      "hsl(" +
      360 * Math.random() +
      "," +
      (25 + 70 * Math.random()) +
      "%," +
      (85 + 10 * Math.random()) +
      "%)"
    );
  }

  private drawRoute(itinerary: JSON, index: Number, color) {
    let stops = this.findStops(itinerary["legs"]);
    let theMap = this.map;
    let _this = this;
    let markers = new H.map.Group();
    stops.forEach(function(stop) {
      var svgIcon = _this.svgMarkup
        .replace("#{color}", color)
        .replace(/#{index}/g, index.toString());
      var icon = new H.map.DomIcon(svgIcon);
      let marker = new H.map.DomMarker(
        {
          lat: stop["coordinates"]["latitude"],
          lng: stop["coordinates"]["longitude"]
        },
        { icon: icon }
      );
      markers.addObject(marker);
    });

    theMap.addObject(markers);

    this.addPolylineToMap(itinerary["legs"], color);

    // get geo bounding box for the group and set it to the map
    this.map.getViewModel().setLookAtData({
      bounds: markers.getBoundingBox()
    });
  }

  private findStops(itineraryLegs) {
    var stops = [];

    itineraryLegs.forEach(function(leg) {
      stops.push(leg.origin);
    });
    stops.push(itineraryLegs[itineraryLegs.length - 1].destination);

    return stops;
  }

  private addPolylineToMap(legs, color) {
    let theMap = this.map;
    let movingMarker = {};
    let _this = this;
    movingMarker["points"] = [];

    legs.forEach(function(leg) {
      var polyLine = new H.geo.LineString();

      leg.points.forEach(function(point) {
        polyLine.pushPoint({ lat: point.latitude, lng: point.longitude });
        movingMarker["points"].push({
          lat: point.latitude,
          lng: point.longitude
        });
      });

      theMap.addObject(
        new H.map.Polyline(polyLine, {
          style: { lineWidth: 7, strokeColor: "darkgrey" }
        })
      );
      theMap.addObject(
        new H.map.Polyline(polyLine, {
          style: { lineWidth: 4, strokeColor: color }
        })
      );
    });

    var icon = new H.map.DomIcon(_this.dotMarkup);
    let marker = new H.map.DomMarker(movingMarker["points"][0], { icon: icon });
    _this.map.addObject(marker);
    movingMarker["marker"] = marker;
    movingMarker["index"] = 0;

    movingMarker["subscription"] = interval(300).subscribe(x => {
      _this.updateMarkerPositions(movingMarker);
    });
  }

  private updateMarkerPositions(movingMarker) {
    this.ease(
      movingMarker["marker"].getGeometry(),
      this.nextPoint(movingMarker),
      400,
      function(coord) {
        movingMarker.marker.setGeometry(coord);
      }
    );
  }

  private nextPoint(movingMarker) {
    let totalPoints = movingMarker["points"].length;
    let newIndex = movingMarker["index"] + 1;
    if (newIndex >= totalPoints) {
      movingMarker["subscription"].unsubscribe();
    }
    movingMarker["index"] = newIndex;
    return movingMarker["points"][newIndex];
  }

  private ease(
    startCoord = { lat: 0, lng: 0 },
    endCoord = { lat: 1, lng: 1 },
    durationMs = 400,
    onStep = console.log,
    onComplete = function() {}
  ) {
    var raf =
        window.requestAnimationFrame ||
        function(f) {
          window.setTimeout(f, 10);
        },
      stepCount = durationMs / 10,
      valueIncrementLat = (endCoord.lat - startCoord.lat) / stepCount,
      valueIncrementLng = (endCoord.lng - startCoord.lng) / stepCount,
      sinValueIncrement = Math.PI / stepCount,
      currentValueLat = startCoord.lat,
      currentValueLng = startCoord.lng,
      currentSinValue = 0;

    function step() {
      currentSinValue += sinValueIncrement;
      currentValueLat += valueIncrementLat * Math.sin(currentSinValue) ** 2 * 2;
      currentValueLng += valueIncrementLng * Math.sin(currentSinValue) ** 2 * 2;

      if (currentSinValue < Math.PI) {
        onStep({ lat: currentValueLat, lng: currentValueLng });
        raf(step);
      } else {
        onStep(endCoord);
        onComplete();
      }
    }

    raf(step);
  }
}
