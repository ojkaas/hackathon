import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

@Injectable({
      providedIn: 'root',
  })
export class RetrieveItineraryService {

  private json: JSON;
  constructor(private http: Http) {}

  async getItineraryByShipment(uuid: string): Promise<any[]> {
    /*
    var url = "api/shipping/shipments/" + uuid + "/itinerary";  
     */
    return new Promise((resolve, reject) => {
      let url = 'assets/itinerary-example-' + uuid + '.json';
      this.http
        .get(url)
        .toPromise()
        .then(res => {
          // Success
          this.json = res.json();
          resolve(res.json());
        });
    });
  }
}