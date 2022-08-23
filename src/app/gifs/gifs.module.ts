import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GifPageComponent } from './gif-page/gif-page.component';
import { BusquedaComponent } from './busqueda/busqueda.component';
import { ResultadosComponent } from './resultados/resultados.component';



@NgModule({
  declarations: [
    GifPageComponent,
    BusquedaComponent,
    ResultadosComponent
  ],
  exports:[
    GifPageComponent
  ],
  imports: [
    CommonModule
  ]
})
export class GifsModule { }
