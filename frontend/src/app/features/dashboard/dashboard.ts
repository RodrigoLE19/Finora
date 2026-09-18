import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';

import {
  DashboardResponse,
  DistribucionGasto
} from '../../models/dashboard.model';

import { Presupuesto } from '../../models/budget.model';


Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnDestroy {

  private dashboardService = inject(DashboardService);
  private budgetService = inject(BudgetService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);


  @ViewChild('gastosChart')
  gastosChart?: ElementRef<HTMLCanvasElement>;

  private chartGastos?: Chart;

  usuario = this.authService.obtenerUsuario();

  dashboard = signal<DashboardResponse | null>(null);

  presupuestos = signal<Presupuesto[]>([]);

  isLoading = signal(true);

  errorMessage = signal('');

  mes = signal(
    new Date().getMonth() + 1
  );

  anio = signal(
    new Date().getFullYear()
  );


  selectorMesAbierto = signal(false);

  anioSelector = signal(
    new Date().getFullYear()
  );


  readonly nombresMeses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];


  readonly nombresMesesCortos = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic'
  ];


  get periodoTexto(): string {

    const nombreMes =
      this.nombresMeses[this.mes() - 1];

    return `${nombreMes} ${this.anio()}`;
  }

  ngOnInit() {

    this.cargarPeriodo();
  }

  cargarPeriodo() {

    const mes = this.mes();
    const anio = this.anio();

    this.cargarDashboard(
      mes,
      anio
    );

    this.cargarPresupuestos(
      mes,
      anio
    );
  }

  cargarDashboard(
    mes: number,
    anio: number
  ) {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.dashboardService
      .obtenerResumen(mes, anio)
      .subscribe({

        next: (response) => {

          this.dashboard.set(response);

          this.isLoading.set(false);

          this.cdr.detectChanges();


          this.crearGraficoGastos(
            response.distribucionGastos
          );
        },


        error: (error) => {

          console.error(
            'Error al cargar dashboard:',
            error
          );

          this.isLoading.set(false);

          this.errorMessage.set(
            'No se pudo cargar la información del Dashboard'
          );
        }
      });
  }


  cargarPresupuestos(
    mes: number,
    anio: number
  ) {

    this.budgetService
      .obtenerPresupuestos(mes, anio)
      .subscribe({

        next: (response) => {

          this.presupuestos.set(
            response.presupuestos
          );
        },


        error: (error) => {

          console.error(
            'Error al cargar presupuestos:',
            error
          );
        }
      });
  }

  alternarSelectorMes() {

    if (this.selectorMesAbierto()) {

      this.cerrarSelectorMes();

      return;
    }

    this.anioSelector.set(
      this.anio()
    );

    this.selectorMesAbierto.set(true);
  }


  cerrarSelectorMes() {

    this.selectorMesAbierto.set(false);
  }


  cambiarAnioSelector(
    cambio: number
  ) {

    this.anioSelector.update(
      anio => anio + cambio
    );
  }


  seleccionarMes(
    numeroMes: number
  ) {

    this.mes.set(
      numeroMes
    );

    this.anio.set(
      this.anioSelector()
    );

    this.cerrarSelectorMes();

    this.cargarPeriodo();
  }


  crearGraficoGastos(
    distribucion: DistribucionGasto[]
  ) {


    if (this.chartGastos) {

      this.chartGastos.destroy();

      this.chartGastos = undefined;
    }

    if (
      distribucion.length === 0 ||
      !this.gastosChart
    ) {

      return;
    }


    const categorias =
      distribucion.map(
        gasto => gasto.categoria
      );


    const montos =
      distribucion.map(
        gasto => Number(gasto.total)
      );


    this.chartGastos = new Chart(
      this.gastosChart.nativeElement,
      {

        type: 'doughnut',


        data: {

          labels: categorias,

          datasets: [
            {

              data: montos,

              backgroundColor: [
                '#087c71',
                '#159589',
                '#5dd4c7',
                '#8eddd5',
                '#a7a9f5',
                '#dc2626',
                '#64748b'
              ],

              borderWidth: 0
            }
          ]
        },


        options: {

          responsive: true,

          maintainAspectRatio: false,

          cutout: '68%',

          plugins: {

            legend: {
              display: false
            }
          }
        }
      }
    );
  }

  ngOnDestroy() {

    if (this.chartGastos) {

      this.chartGastos.destroy();
    }
  }
}