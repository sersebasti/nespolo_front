import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TavoloComponent } from './tavolo/tavolo.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';

import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';


import { HttpClientModule } from '@angular/common/http';
import { CommandaComponent } from './commanda/commanda.component';
import { PizzeriaComponent } from './pizzeria/pizzeria.component';
import { CucinaComponent } from './cucina/cucina.component';





@NgModule({
  declarations: [
    AppComponent,
    TavoloComponent,
    CommandaComponent,
    PizzeriaComponent,
    CucinaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatListModule,
    MatRadioModule,
    MatGridListModule,
    MatFormFieldModule,
    HttpClientModule,
  ],
  providers: [    
    // Use the custom theme for all form fields
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'fill' },
    },{
    provide: MAT_RADIO_DEFAULT_OPTIONS,
    useValue: { color: 'black' }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 

  
}
