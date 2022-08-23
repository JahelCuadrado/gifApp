import { Component, ElementRef, ViewChild } from '@angular/core';
import { GifsService } from '../services/gifs.service';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent{

    constructor(
      private gifsService : GifsService
    ){
    }

    @ViewChild('txtbuscar') txtbuscar!:ElementRef<HTMLInputElement>;

    buscar(){
      var valor = this.txtbuscar.nativeElement.value;
      this.gifsService.buscarGifs(valor)
      this.txtbuscar.nativeElement.value = "";
    }

}
