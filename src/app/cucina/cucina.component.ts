import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DjangoService } from '../servizi/django.service';
import { DataService } from '../servizi/data.service';
import { GenericService } from '../servizi/generic.service';

@Component({
  selector: 'app-cucina',
  templateUrl: './cucina.component.html',
  styleUrl: './cucina.component.css'
})
export class CucinaComponent {
  @Input() freq: any;
  @Output() ToLogin = new EventEmitter<boolean>();

  commanda: Commanda[] = [];

  url_main: string | undefined
  url_products: string | undefined
  url_commande: string | undefined
  url_tavoli: string | undefined
  url_ordinazione: string | undefined

  url_collection_status: string;

  intervalIdOrdinazioni: undefined | ReturnType<typeof setTimeout>;

  constructor(private django: DjangoService, private dataService: DataService, 
    private genericService: GenericService){
    
    this.url_main  = dataService.url_main
    this.url_collection_status = "";
  }

  ngOnInit(): void {
    
    /*
    collection_id:
    1 -> Pizzeria
    2 -> Cucina
    3 -> Bar
    */

    // Acquisico le pizze da fare dal servizio django - freq (ms)
    this.url_collection_status = this.url_main + "commanda_collection_status/?product_collection_id=2&production_status=B";
  
    this.django.getData(this.url_collection_status).subscribe((data: any) =>{
      this.commanda = data;
    });

    this.intervalIdOrdinazioni = setInterval(()=>{

      this.django.getData(this.url_collection_status).subscribe((data: any) =>{

        if(!this.genericService.arraysAreEqual(data, this.commanda)){
          console.log(this.commanda);
          this.commanda = data;
          console.log("aggiornato commanda")
        }

      });
    }, this.freq);
    
  }


  //remove(element: any){this.commandaComponent.remove(element)}
  remove(element: any){
    this.django.deleteData(this.dataService.urls.commande + element.id + "/").subscribe((data: any) =>{

      this.django.getData(this.url_collection_status).subscribe((data: any) =>{
        this.commanda = data;
        console.log(data);
      });

    });
  }

  
  //change_production_status(data: any, status: any){this.commandaComponent.change_production_status(data, status)}
  change_production_status(data: any, status: any){
    
    console.log(data)

    var body =
    {
      "production_status": status
    }

    this.django.doModify(this.dataService.urls.commande + data.id + "/", body).subscribe((data: any) =>{
      this.django.getData(this.url_collection_status).subscribe((data: any) =>{
        this.commanda = data;
        console.log(data);
      });
    });

  }

  ngOnDestroy(): void {
    console.log("ngOnTavoloDestroy");
    clearInterval(this.intervalIdOrdinazioni);
  }

  toLogin(data: any){
    console.log("toLogin")
    this.ToLogin.emit(true)
  }
}



export interface Commanda{
  id: number;
  quantity: number;
  product_id: number;
  tavolo_id: number;
  production_status: string;
  note: string;
  product__collection_id: number;
  product__title: string;
  tavolo__nome: string
}
