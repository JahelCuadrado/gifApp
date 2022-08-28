import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchGifsResponse, Gif } from '../interfaces/gifs.interface';

@Injectable({
  providedIn: 'root'
})
export class GifsService {

    private  apiKey      : string   = 'xZOQIosef8TSfliC2nmKD4QbGINrZAkm';
    private  servicioUrl : string   = 'https://api.giphy.com/v1/gifs';
    private _historial   : string[] = [];
    public   resultados  : Gif[]    = [];

    constructor(
      private http: HttpClient
    ){

      this._historial = JSON.parse(localStorage.getItem('historial')!) || [];
      this.resultados = JSON.parse(localStorage.getItem('resultados')!) || [];

    }

    get historial(){
      return [...this._historial]
    }

    buscarGifs( query : string){
      if(!this._historial.includes(query.toLowerCase())) {

        this._historial.unshift(query.toLowerCase());
        this._historial = this._historial.splice(0,10);

        localStorage.setItem('historial', JSON.stringify(this._historial));

      }

       const param = new HttpParams()
       .set('api_key', this.apiKey)
       .set('q', query)
       .set('limit', 30)

      //TODO: poner en apuntes la peticion get y la interfaz de tipado y el local storage
      this.http.get<SearchGifsResponse>(`${this.servicioUrl}/search?`, {params: param}).subscribe((resp) => {

          console.log(resp.data);
          this.resultados = resp.data;
          localStorage.setItem('resultados', JSON.stringify(this.resultados))

      });
    }

}
