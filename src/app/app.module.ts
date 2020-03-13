import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HttpModule } from '@angular/http';
import { HereMapComponent } from './here-map/here-map.component';
import { RetrieveItineraryService } from './services/retrieve-itinerary.service';
import { EquipmentVisualizerComponent } from './equipment-visualizer/equipment-visualizer.component';
import { RetrieveLoadplanService } from './services/retrieve-loadplan.service';

@NgModule({
  imports:      [ BrowserModule, FormsModule, HttpModule ],
  declarations: [ AppComponent, HereMapComponent, EquipmentVisualizerComponent ],
  bootstrap:    [ AppComponent ],
  providers: [RetrieveItineraryService, RetrieveLoadplanService]
})
export class AppModule { }
