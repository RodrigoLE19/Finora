import { 
  ChangeDetectorRef,
  Component, 
  computed, 
  ElementRef,
  inject, 
  OnDestroy,
  OnInit, 
  signal,
  ViewChild
} from '@angular/core';
import { StatisticsService } from '../../core/services/statistics.service';
import { EstadisticasResponse, GastoPorCategoria } from '../../models/statistics.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  imports: [],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics implements OnInit, OnDestroy {

  private dcr = inject(ChangeDetectorRef);

  @ViewChild('gastosCategoriaChart')
  gastosCategoriaChart?: ElementRef<HTMLCanvasElement>;

  private chartGastosCategoria?: Chart;

  @ViewChild('ingresosGastosChart')
  ingresosGastosChart?: ElementRef<HTMLCanvasElement>;

  private chartIngresosGastos?: Chart;

  @ViewChild('balanceChart')
  balanceChart?: ElementRef<HTMLCanvasElement>;

  private chartBalance?: Chart;

  private statisticsService = inject(StatisticsService);

  estadisticas = signal<EstadisticasResponse | null>(null);

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

  readonly nombreMeses = [
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

  readonly coloresCategorias: Record<string, string> = {
    'Alimentación': '#0F766E',
    'Transporte': '#4F46E5',
    'Hogar': '#F59E0B',
    'Entretenimiento': '#8B5CF6',
    'Servicios': '#2563EB',
    'Salud': '#EF4444',
    'Educación': '#06B6D4',
    'Otros': '#64748B'
  };


  obtenerColorCategoria(
    categoria: string
  ): string {

    return this.coloresCategorias[categoria]
      ?? '#94A3B8';
  }

  get periodoTexto(): string {

    const nombreMes = this.nombreMeses[this.mes() - 1];
    return `${nombreMes} ${this.anio()}`;
  }

  ngOnInit() {
    this.cargarEstadisticas();
  }

  ngOnDestroy() {
    
    if (this.chartGastosCategoria) {
      this.chartGastosCategoria.destroy();
    }

    if (this.chartIngresosGastos) {
      this.chartIngresosGastos.destroy();
    }

    if (this.chartBalance) {
      this.chartBalance.destroy();
    }
  }

  cargarEstadisticas() {

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.statisticsService
      .obtenerEstadisticas(
        this.mes(),
        this.anio()
      )
      .subscribe({

        next: (response) => {

          this.estadisticas.set(response);

          this.isLoading.set(false);

          this.dcr.detectChanges();

          this.crearGraficoGastosCategoria(response.gastosPorCategoria);

          this.crearGraficoIngresosGastos(response.evolucionMensual);

          this.crearGraficoBalance(response.evolucionMensual);
        },

        error: (error) => {

          console.error('Error al cargar estadísticas:', error);

          this.errorMessage.set('No se pudieron cargar las estadísticas.');

          this.isLoading.set(false);
        }
      });

  }

  crearGraficoGastosCategoria(
    gastos: GastoPorCategoria[]
  ) {

    if (this.chartGastosCategoria) {
      
      this.chartGastosCategoria.destroy();

      this.chartGastosCategoria = undefined;
    }

    if (
      gastos.length === 0 ||
      !this.gastosCategoriaChart
    ) {
      return;
    }

    const categorias = gastos.map(gastos => gastos.categoria);

    const montos = gastos.map(gastos => Number(gastos.total));

    const colores = gastos.map(
      gastos =>
        this.obtenerColorCategoria(
          gastos.categoria
        )
    );

    this.chartGastosCategoria = new Chart(
      this.gastosCategoriaChart.nativeElement,
      {

        type: 'doughnut',

        data: {

          labels: categorias,

          datasets: [
            {
              data: montos,
              backgroundColor: colores,
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

  crearGraficoIngresosGastos(
    evolucion: {
      anio: number;
      mes: number;
      ingresos: string;
      gastos: string;

    }[]
  ) {

    if (this.chartIngresosGastos) {
      this.chartIngresosGastos.destroy();
      this.chartIngresosGastos = undefined;
    }

    if (
      evolucion.length === 0 ||
      !this.ingresosGastosChart
    ) {
      return;
    }

    const labels = evolucion.map(
      item => this.nombresMesesCortos[item.mes - 1]
    );

    const ingresos = evolucion.map(
      item => Number(item.ingresos)
    );

    const gastos = evolucion.map(
      item => Number(item.gastos)
    );

    this.chartIngresosGastos = new Chart(
      this.ingresosGastosChart.nativeElement,
      {
        type: 'bar',

        data: {
          labels,

          datasets: [
            {
              label: 'Ingresos',
              data: ingresos,
              backgroundColor: '#087c71',
              borderRadius: 6,
              barThickness: 28
            },
            {
              label: 'Gastos',
              data: gastos,
              backgroundColor: '#dc2626',
              borderRadius: 6,
              barThickness: 28
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          scales: {
            y: {
              beginAtZero: true,

              ticks: {
                callback: (value) =>
                  `S/ ${Number(value).toFixed(0)}`
              },

              grid: {
                color: '#eef0f4'
              }
            },

            x: {
              grid: {
                display: false
              }
            }
          },

          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8
              }
            }
          }
        }
      }
    );

  }

  crearGraficoBalance(
    evolucion: {
      anio: number;
      mes: number;
      ingresos: string;
      gastos: string;
    }[]
  ) {
    
    if (this.chartBalance) {
      this.chartBalance.destroy();
      this.chartBalance = undefined;
    }

    if (
      evolucion.length === 0 ||
      !this.balanceChart
    ) {
      return;
    }

    const labels = evolucion.map(
      item =>
        this.nombresMesesCortos[item.mes -1]
    );

    const balance = evolucion.map(
      item =>
        Number(item.ingresos) -
        Number(item.gastos)
    );

    this.chartBalance = new Chart(
      this.balanceChart.nativeElement,
      {

        type: 'line',

        data: {

          labels,

          datasets: [
            {
              label: 'Balance',
              data: balance,

              borderColor: '#087c71',
              backgroundColor: 'rgba(8, 124, 113, 0.12)',

              fill: true,

              tension: 0.35,

              pointHitRadius: 7,

              pointBackgroundColor: '#087c71'
            }
          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false,

          scales: {

            y: {

              ticks: {
                callback: (value) =>
                  `S/ ${Number(value).toFixed(0)}`
              },

              grid: {
                color: '#eef0f4'
              }

            },

            x: {
              grid: {
                display: false
              }
            }
          },

          plugins: {

            legend: {
              display: false
            }
          }
        }
      }
    );
  }

  balanceActual(): number {

    const datos = this.estadisticas();

    if (!datos) {
      return 0;
    }

    return(
      Number(datos.ingresosVsGastos.ingresos)
      - 
      Number(datos.ingresosVsGastos.gastos)
    );
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

    this.mes.set(numeroMes);

    this.anio.set(
      this.anioSelector()
    );

    this.cerrarSelectorMes();
    this.cargarEstadisticas();
  }

  variacionMensual = computed(() => {

    const datos = this.estadisticas();

    if (!datos) {
      return 0;
    }

    return Number(
      datos.comparacionMensual.porcentaje_cambio
    );
  });

  mensajeComparacion = computed(() => {

    const variacion = this.variacionMensual();

    if (variacion > 0) {
      
      return `Tus gastos aumentaron ${variacion.toFixed(2)}% respecto al mes anterior.`;
    }

    if (variacion < 0) {
      return `Tus gastos disminuyeron ${Math.abs(variacion).toFixed(2)}% respecto al mes anterior.`;
    }

    return 'Tus gastos se mantuvieron iguales al mes anterior.';
  });

  totalGastosCategoria = computed(() => {

    const datos = this.estadisticas();

    if (!datos) {
      return 0;
    }

    return datos.gastosPorCategoria.reduce(
      (total, gasto) =>
        total + Number(gasto.total),
      0
    );
  });

  obtenerPorcentajeCategoria(
    totalCategoria: string
  ): number {

    const total = this.totalGastosCategoria();

    if (total === 0) {
      return 0;
    }

    return (
      Number(totalCategoria) /
      total
    ) * 100
  }

  formatearMonto(valor: string): string {

    return Number(valor).toFixed(2);
  }
}
