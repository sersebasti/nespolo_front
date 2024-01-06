import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  freq: number = 1000
  userType: string | undefined
  check: boolean = false
  
  loginVisible: boolean | undefined
  tavoliVisible: boolean | undefined
  commandaVisible: boolean | undefined
  pizzeriaVisible: boolean | undefined
  cucinaVisible: boolean | undefined;
  dataTavolo: object | undefined
  dataUsername: string | undefined
 

  selectedOption: string | undefined;

  ruoli: string[] = ['Cameriere', 'Pizzaiolo', 'Cuoco'];

  ngOnInit(): void {
    
    this.loginVisible = true
    this.commandaVisible = false 
    this.pizzeriaVisible = false
    this.tavoliVisible = false
    this.cucinaVisible = false
    //get user type
    //this.userType = "Cameriere"
    //this.userType = "Pizzaiolo"
    //this.userType = "Cuoco"
    
   
  }
  // ottenuto da sendTavoloData di tavolo.component.ts, *ngFor='let tavolo of tavoli' (click)="onTavoloClick(tavolo) nel .html
  getTavoloData(data: string){
    console.log(JSON.parse(data))
    this.dataTavolo = JSON.parse(data)
    this.tavoliVisible = false
    this.commandaVisible = true
  }

  goToTavoli(data: any){
    console.log(data)
    this.tavoliVisible = data
    this.commandaVisible = !data
  }

  getTavoloUsername(data: any){
    this.dataUsername = data
  }

  onRadioChange(){
    console.log('Radio button selected:', this.selectedOption);
    this.loginVisible = false

    switch (this.selectedOption) {
      case "Cameriere":
        this.tavoliVisible = true
        break;
      case 'Pizzaiolo':
        this.pizzeriaVisible = true
        break;
      case 'Cuoco':
        this.cucinaVisible = true
        break;
    }

  }  
  
  goToLogin(data: any){
    this.loginVisible = true
    this.commandaVisible = false 
    this.pizzeriaVisible = false
    this.tavoliVisible = false
    this.cucinaVisible = false
    this.check = false
    this.selectedOption = ''
  }
  


}
