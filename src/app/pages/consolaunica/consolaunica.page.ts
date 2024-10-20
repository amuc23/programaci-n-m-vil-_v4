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
  estaEnFavoritos: boolean = false;

  constructor(
    private bd: ManejodbService,
    private router: Router,
    private activedroute: ActivatedRoute,
    private alertasService: AlertasService
  ) {
    this.activedroute.queryParams.subscribe((res) => {
      if (this.router.getCurrentNavigation()?.extras.state) {
        this.consolaLlego = this.router.getCurrentNavigation()?.extras?.state?.['consolaSelect'];
      }
    });
  }

  async ionViewWillEnter() {
    await this.validarSiHayResecna();
    await this.verificarSiEstaEnFavoritos();
  }

  ngOnInit() {
    this.bd.dbState().subscribe(async (data) => {
      if (data) {
        await this.fetchConsolaUnica();
        await this.obtenerResecnas2();
      }
    });
  }

  async verificarSiEstaEnFavoritos() {
    try {
      this.idUserLogged = await this.bd.obtenerIdUsuarioLogueado();
      this.estaEnFavoritos = await this.bd.verificarFav(
        this.consolaLlego.id_producto,
        this.idUserLogged
      );
    } catch (error) {
      console.error('Error al verificar si está en favoritos:', error);
    }
  }

  async agregarAFavoritos() {
    try {
      const idUserLogged = await this.bd.obtenerIdUsuarioLogueado();
      if (!idUserLogged) {
        this.alertasService.presentAlert('Error', 'Debes estar logueado para agregar a favoritos.');
        return;
      }

      await this.bd.agregarFav(idUserLogged, this.consolaLlego.id_producto);
      this.estaEnFavoritos = true;
      this.alertasService.presentAlert('Éxito', 'Añadido a favoritos');
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
      this.alertasService.presentAlert('Error', 'No se pudo añadir a favoritos: ' + JSON.stringify(error));
    }
  }

  async quitarDeFavoritos() {
    try {
      await this.bd.quitarFav(this.consolaLlego.id_producto, this.idUserLogged);
      this.estaEnFavoritos = false;
      this.alertasService.presentAlert('Éxito', 'Eliminado de favoritos');
    } catch (error) {
      console.error('Error al quitar de favoritos:', error);
      this.alertasService.presentAlert('Error', 'No se pudo eliminar de favoritos: ' + JSON.stringify(error));
    }
  }

  async validarSiHayResecna() {
    this.hayResecna = false;
    const usuarioLogueado = await this.bd.obtenerUsuarioLogueado();
    if (usuarioLogueado) {
      const id_usuario = usuarioLogueado.id_usuario;
      const existeResecna = await this.bd.consultarResecnaPorIdProductoYUsuario(
        this.consolaLlego.id_producto,
        id_usuario
      );
      this.hayResecna = !!existeResecna;
    }
  }

  async SubirResecna() {
    try {
      const idUserLogged = await this.bd.obtenerIdUsuarioLogueado();
      if (!idUserLogged) {
        this.alertasService.presentAlert('Error', 'Debes estar logueado para subir una reseña.');
        return;
      }

      await this.bd.agregarResecnas(this.laresecna, idUserLogged, this.consolaLlego.id_producto);
      this.laresecna = '';
      this.hayResecna = true;
      await this.obtenerResecnas2();
      await this.fetchConsolaUnica();
    } catch (error) {
      console.error('Error al subir reseña:', error);
      this.alertasService.presentAlert('Error', 'No se pudo subir la reseña: ' + JSON.stringify(error));
    }
  }

  async obtenerResecnas2() {
    try {
      this.arregloresecnas = await this.bd.obtenerResecnas2(this.consolaLlego.id_producto);
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
      this.alertasService.presentAlert('Error', 'No se pudieron cargar las reseñas: ' + JSON.stringify(error));
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
