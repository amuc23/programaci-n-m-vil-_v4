import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertasService } from 'src/app/services/alertas.service';
import { ManejodbService } from 'src/app/services/manejodb.service';

@Component({
  selector: 'app-jugueteunico',
  templateUrl: './jugueteunico.page.html',
  styleUrls: ['./jugueteunico.page.scss'],
})
export class JugueteunicoPage implements OnInit {

  jugueteLlego: any;
  laresecna: string = ''; 
  hayResecna: boolean = false;
  idUserLogged!: any;
  arregloresecnas: any = [];
  estaEnListaDeseos: boolean = false; // Estado inicial

  constructor(
    private bd: ManejodbService, 
    private router: Router, 
    private activedroute: ActivatedRoute, 
    private alertasService: AlertasService
  ) {
    this.activedroute.queryParams.subscribe(res => {
      if (this.router.getCurrentNavigation()?.extras.state) {
        this.jugueteLlego = this.router.getCurrentNavigation()?.extras.state?.['jugueteSelect'];
      }
    });
  }

  async ionViewWillEnter() {
    await this.validarSiHayResecna();
    this.verificarSiEstaEnListaDeseos();
  }

  ngOnInit() {
    this.bd.dbState().subscribe(data => {
      if (data) {
        this.fetchJugueteUnico().then(() => {
          this.obtenerResecnas2();
        });
      }
    });
  }

  verificarSiEstaEnListaDeseos() {
    this.estaEnListaDeseos = this.jugueteLlego.enListaDeseos || false;
  }

  agregarAListaDeseos() {
    this.estaEnListaDeseos = true;
    this.alertasService.presentAlert('Añadido a Lista de Deseos', '¡Gracias!');
  }

  quitarDeListaDeseos() {
    this.estaEnListaDeseos = false;
    this.alertasService.presentAlert('Eliminado de Lista de Deseos', '¡Eliminado correctamente!');
  }

  async validarSiHayResecna() {
    this.hayResecna = false;
    const usuarioLogueado = await this.bd.obtenerUsuarioLogueado();
    if (usuarioLogueado) {
      const id_usuario = usuarioLogueado.id_usuario;
      if (await this.bd.consultarResecnaPorIdProductoYUsuario(this.jugueteLlego.id_producto, id_usuario)) {
        this.hayResecna = true;
      }
    }
  }

  async SubirResecna() {
    this.idUserLogged = await this.bd.obtenerIdUsuarioLogueado();
    if (this.idUserLogged) {
      await this.bd.agregarResecnas(this.laresecna, this.idUserLogged, this.jugueteLlego.id_producto);
      this.laresecna = '';
      this.hayResecna = true;
      await this.obtenerResecnas2();
      await this.fetchJugueteUnico();
    } else {
      this.alertasService.presentAlert("Error", "Debes estar logueado para agregar una reseña.");
    }
  }

  async obtenerResecnas2() {
    try {
      this.arregloresecnas = await this.bd.obtenerResecnas2(this.jugueteLlego.id_producto);
    } catch (error) {
      this.alertasService.presentAlert('Error al cargar reseñas', `ERROR: ${error}`);
    }
  }

  async fetchJugueteUnico() {
    try {
      const jugueteUnico = await this.bd.consultarJuguetePorId(this.jugueteLlego.id_producto);
      if (jugueteUnico) {
        this.jugueteLlego = jugueteUnico;
      } else {
        console.error('No se encontró el juguete con el ID:', this.jugueteLlego.id_producto);
      }
    } catch (error) {
      console.error('Error al consultar el juguete:', error);
    }
  }

  compra() {
    this.alertasService.presentAlert('Añadido al carro', '¡Gracias!');
  }

  getImagenUsuario(foto: string | null): string {
    return foto ? foto : 'assets/img/user_default_photo.jpg';
  }
}
