import { Component } from '@angular/core';
import { DataService } from './servizi/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
  version: string | undefined
  
  showMain: boolean = false
  showTavoli: boolean  = false
  showCommanda: boolean = false
  showPizzeria: boolean = false
  showCucina: boolean = false;
  
  constructor(private dataService: DataService){this.version = dataService.version;}

  ngOnInit(): void {
    this.dataService.mainVisible$.subscribe(data =>{this.showMain = data;})
    this.dataService.tavoliVisible$.subscribe(data =>{this.showTavoli = data;})
    this.dataService.commandaVisible$.subscribe(data =>{this.showCommanda = data;})
    this.dataService.pizzeriaVisible$.subscribe(data =>{this.showPizzeria = data;})
    this.dataService.cucinaVisible$.subscribe(data =>{this.showCucina = data;})
  }

  onRadioChange(event: any){
    console.log('Radio button selected:' + event.value);
    this.dataService.setPage(event.value);
  } 

}
