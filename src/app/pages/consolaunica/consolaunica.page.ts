import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertasService } from 'src/app/services/alertas.service';
import { ManejodbService } from 'src/app/services/manejodb.service';

@Component({
  selector: 'app-consolaunica',
  templateUrl: './consolaunica.page.html',
  styleUrls: ['./consolaunica.page.scss'],
})
export class ConsolaunicaPage implements OnInit {

  consolaLlego: any;
  laresecna: string = '';
  hayResecna: boolean = false;
  idUserLogged!: any;
  arregloresecnas: any = [];
  estaEnFavoritos: boolean = false; // Estado inicial

  constructor(
    private bd: ManejodbService,
    private router: Router,
    private activedroute: ActivatedRoute,
    private alertasService: AlertasService
  ) {
    this.activedroute.queryParams.subscribe(res => {
      if (this.router.getCurrentNavigation()?.extras.state) {
        this.consolaLlego = this.router.getCurrentNavigation()?.extras?.state?.['consolaSelect'];
      }
    });
  }

  async ionViewWillEnter() {
    await this.validarSiHayResecna();
    this.verificarSiEstaEnFavoritos(); // Verificar si está en favoritos
  }

  ngOnInit() {
    this.bd.dbState().subscribe(data => {
      if (data) {
        this.fetchConsolaUnica().then(() => {
          this.obtenerResecnas2();
        });
      }
    });
  }

  verificarSiEstaEnFavoritos() {
    this.estaEnFavoritos = this.consolaLlego.favorito || false;
  }

  agregarAFavoritos() {
    this.estaEnFavoritos = true;
    this.alertasService.presentAlert('Añadido a Lista de Deseos', '¡Gracias!');
  }

  quitarDeFavoritos() {
    this.estaEnFavoritos = false;
    this.alertasService.presentAlert('Quitado de Favoritos', '¡Eliminado correctamente!');
  }

  async validarSiHayResecna() {
    this.hayResecna = false;
    const usuarioLogueado = await this.bd.obtenerUsuarioLogueado();
    if (usuarioLogueado) {
      const id_usuario = usuarioLogueado.id_usuario;
      if (await this.bd.consultarResecnaPorIdProductoYUsuario(this.consolaLlego.id_producto, id_usuario)) {
        this.hayResecna = true;
      }
    }
  }

  async SubirResecna() {
    this.idUserLogged = await this.bd.obtenerIdUsuarioLogueado();
    if (this.idUserLogged) {
      await this.bd.agregarResecnas(this.laresecna, this.idUserLogged, this.consolaLlego.id_producto);
      this.laresecna = '';
      this.hayResecna = true;
      await this.obtenerResecnas2();
      await this.fetchConsolaUnica();
    } else {
      this.alertasService.presentAlert("Error", "Debes estar logueado para agregar una reseña.");
    }
  }

  async obtenerResecnas2() {
    try {
      this.arregloresecnas = await this.bd.obtenerResecnas2(this.consolaLlego.id_producto);
    } catch (error) {
      this.alertasService.presentAlert('Error al cargar reseñas', `ERROR: ${error}`);
    }
  }

  async fetchConsolaUnica() {
    try {
      const consolaUnica = await this.bd.consultarConsolaPorId(this.consolaLlego.id_producto);
      if (consolaUnica) {
        this.consolaLlego = consolaUnica;
      } else {
        console.error('No se encontró la consola con el ID:', this.consolaLlego.id_producto);
      }
    } catch (error) {
      console.error('Error al consultar la consola:', error);
    }
  }

  compra() {
    this.alertasService.presentAlert('Añadido al carro', '¡Gracias!');
  }

  getImagenUsuario(foto: string | null): string {
    return foto ? foto : 'assets/img/user_default_photo.jpg';
  }
}
