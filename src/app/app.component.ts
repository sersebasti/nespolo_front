import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  freq: number = 500
  userType: string | undefined

  tavoliVisible: boolean | undefined
  commandaVisible: boolean | undefined

  dataTavolo: object | undefined
  

  ngOnInit(): void {

    this.commandaVisible = false 

    //get user type
    this.userType = "C"
    
    if(this.userType == "C"){
      this.tavoliVisible = true
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
