import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  freq: number = 250
  userType: string | undefined

  tavoliVisible: boolean | undefined
  commandaVisible: boolean | undefined
  pizzeriaVisible: boolean | undefined

  dataTavolo: object | undefined
  

  ngOnInit(): void {

    this.commandaVisible = false 

    //get user type
    this.userType = "Commessa"
    //this.userType = "Pizzaiolo"
    //this.userType = "Cuoca"

    switch (this.userType) {
      case "Commessa":
        this.tavoliVisible = true
        break;
      case 'Pizzaiolo':
        this.pizzeriaVisible = true
        break;
      case 'Cuoca':
        console.log('It\'s an orange.');
        break;
    }
  
   
  }

  getTavoloData(data: string){
    console.log(JSON.parse(data))
    this.dataTavolo = JSON.parse(data)
    this.tavoliVisible = false
    this.commandaVisible = true
  }

  goToTavoli(data: any){
    console.log("eccomi 2")
    console.log(data)
    this.tavoliVisible = data
    this.commandaVisible = !data
  }

  


}
