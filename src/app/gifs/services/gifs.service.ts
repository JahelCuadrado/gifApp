import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GifsService {

    private  apiKey     : string   = 'xZOQIosef8TSfliC2nmKD4QbGINrZAkm'
    private _historial  : string[] = [];
    private  resultados : any[]    = [];  //TODO: Cambiar any por su tipo

    constructor(
      private http: HttpClient
    ){}

    get historial(){
      return [...this._historial]
    }

    buscarGifs( query : string){
      if(!this._historial.includes(query.toLowerCase())) {
        this._historial.unshift(query.toLowerCase())
        this._historial = this._historial.splice(0,10);
      }

      this.http.get(`https://api.giphy.com/v1/gifs/search?api_key=xZOQIosef8TSfliC2nmKD4QbGINrZAkm&q=${query}&limit=10`).subscribe((resp:any) => {
          console.log(resp.data)
      });
    }

}
