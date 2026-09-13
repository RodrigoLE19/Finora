import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { MainLayout } from './shared/components/main-layout/main-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { Movements } from './features/movements/movements';
import { Budgets } from './features/budgets/budgets';
import { RecurringExpenses } from './features/recurring-expenses/recurring-expenses';
import { Statistics } from './features/statistics/statistics';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'movements',
                component: Movements
            },
            {
                path: 'budgets',
                component: Budgets
            },
            {
                path: 'recurring-expenses',
                component: RecurringExpenses
            },
            {
                path: 'statistics',
                component: Statistics
            }
        ]

    },
    {
        path: '**',
        redirectTo: 'login'
    }

];
