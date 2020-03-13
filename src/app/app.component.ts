import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
  
declare var H: any;  
  
@Component({  
  selector: 'app-root',  
  templateUrl: './app.component.html',  
  styleUrls: ['./app.component.css']  
})  
export class AppComponent {  
  title = 'HereMapDemo';  

  public constructor() {  
      
  }  
  
  public ngOnInit() {  
  }  
  
  public ngAfterViewInit() {  
  }  
  
}  