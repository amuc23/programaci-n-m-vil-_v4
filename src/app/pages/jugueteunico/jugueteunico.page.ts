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
  estaEnListaDeseos: boolean = false;

  constructor(
    private bd: ManejodbService, 
    private router: Router, 
    private activedroute: ActivatedRoute, 
    private alertasService: AlertasService
  ) {
    this.activedroute.queryParams.subscribe((res) => {
      if (this.router.getCurrentNavigation()?.extras.state) {
        this.jugueteLlego = this.router.getCurrentNavigation()?.extras?.state?.['jugueteSelect'];
      }
    });
  }

  async ionViewWillEnter() {
    await this.validarSiHayResecna();
    await this.verificarSiEstaEnListaDeseos();
  }

  ngOnInit() {
    this.bd.dbState().subscribe(async (data) => {
      if (data) {
        await this.fetchJugueteUnico();
        await this.obtenerResecnas2();
      }
    });
  }

  async verificarSiEstaEnListaDeseos() {
    try {
      this.idUserLogged = await this.bd.obtenerIdUsuarioLogueado();
      this.estaEnListaDeseos = await this.bd.verificarFav(
        this.jugueteLlego.id_producto, 
        this.idUserLogged
      );
    } catch (error) {
      console.error('Error al verificar la lista de deseos:', error);
    }
  }

  async agregarAListaDeseos() {
    try {
      const idUserLogged = await this.bd.obtenerIdUsuarioLogueado();
      if (!idUserLogged) {
        this.alertasService.presentAlert('Error', 'Debes estar logueado para agregar a la lista de deseos.');
        return;
      }

      await this.bd.agregarFav(idUserLogged, this.jugueteLlego.id_producto);
      this.estaEnListaDeseos = true;
      this.alertasService.presentAlert('Éxito', 'Añadido a la lista de deseos');
    } catch (error) {
      console.error('Error al agregar a la lista de deseos:', error);
      this.alertasService.presentAlert('Error', 'No se pudo añadir a la lista de deseos: ' + JSON.stringify(error));
    }
  }

  async quitarDeListaDeseos() {
    try {
      await this.bd.quitarFav(this.jugueteLlego.id_producto, this.idUserLogged);
      this.estaEnListaDeseos = false;
      this.alertasService.presentAlert('Éxito', 'Eliminado de la lista de deseos');
    } catch (error) {
      console.error('Error al eliminar de la lista de deseos:', error);
      this.alertasService.presentAlert('Error', 'No se pudo eliminar: ' + JSON.stringify(error));
    }
  }

  async validarSiHayResecna() {
    this.hayResecna = false;
    const usuarioLogueado = await this.bd.obtenerUsuarioLogueado();
    if (usuarioLogueado) {
      const id_usuario = usuarioLogueado.id_usuario;
      const existeResecna = await this.bd.consultarResecnaPorIdProductoYUsuario(
        this.jugueteLlego.id_producto, 
        id_usuario
      );
      this.hayResecna = !!existeResecna;
    }
  }

  async SubirResecna() {
    try {
      const idUserLogged = await this.bd.obtenerIdUsuarioLogueado();
      if (!idUserLogged) {
        this.alertasService.presentAlert("Error", "Debes estar logueado para agregar una reseña.");
        return;
      }

      await this.bd.agregarResecnas(this.laresecna, idUserLogged, this.jugueteLlego.id_producto);
      this.laresecna = ''; // Reiniciar la reseña
      this.hayResecna = true;
      await this.obtenerResecnas2();
      await this.fetchJugueteUnico();
    } catch (error) {
      console.error('Error al subir reseña:', error);
      this.alertasService.presentAlert('Error', 'No se pudo subir la reseña: ' + JSON.stringify(error));
    }
  }

  async obtenerResecnas2() {
    try {
      this.arregloresecnas = await this.bd.obtenerResecnas2(this.jugueteLlego.id_producto);
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
      this.alertasService.presentAlert('Error', 'No se pudieron cargar las reseñas: ' + JSON.stringify(error));
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
