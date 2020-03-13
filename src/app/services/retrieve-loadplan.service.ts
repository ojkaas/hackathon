import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

@Injectable({
      providedIn: 'root',
  })
export class RetrieveLoadplanService {

  private json: JSON;
  constructor(private http: Http) {}

  async getPackageArrangementByEquipmentUsage(uuid: string): Promise<any[]> {
    /*
    var url = "api/shipping/shipments/" + uuid + "/loadplan";  
     */
    return new Promise((resolve, reject) => {
      let url = 'assets/package-arrangement.json';
      this.http
        .get(url)
        .toPromise()
        .then(res => {
          // Success
          console.log(res);
          this.json = res.json();
          resolve(res.json());
        });
    });
  }
}