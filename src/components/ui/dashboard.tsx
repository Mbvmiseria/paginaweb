'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InfoIcon } from 'lucide-react'

type Transaction = {
  id: number
  type: 'ingreso' | 'gasto'
  amount: number
  category: string
  description: string
  date: string
}

type DashboardProps = {
  transactions?: Transaction[]
}

export default function Dashboard({ transactions = [] }: DashboardProps) {
  const [timeRange, setTimeRange] = useState('6m')

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    return transactions.filter(t => new Date(t.date) >= sixMonthsAgo);
  }, [transactions])

  const incomeVsExpenses = useMemo(() => {
    const data: { [key: string]: { name: string, ingresos: number, gastos: number } } = {}
    filteredTransactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' })
      if (!data[month]) {
        data[month] = { name: month, ingresos: 0, gastos: 0 }
      }
      if (t.type === 'ingreso') {
        data[month].ingresos += t.amount
      } else {
        data[month].gastos += t.amount
      }
    })
    return Object.values(data)
  }, [filteredTransactions])

  const expensesByCategory = useMemo(() => {
    const data: { [key: string]: number } = {}
    filteredTransactions.filter(t => t.type === 'gasto').forEach(t => {
      if (!data[t.category]) {
        data[t.category] = 0
      }
      data[t.category] += t.amount
    })
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [filteredTransactions])

  const monthlyProgression = useMemo(() => {
    const data: { [key: string]: { name: string, balance: number } } = {}
    let runningBalance = 0
    filteredTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' })
      runningBalance += t.type === 'ingreso' ? t.amount : -t.amount
      data[month] = { name: month, balance: runningBalance }
    })
    return Object.values(data)
  }, [filteredTransactions])

  const recentTransactions = useMemo(() => {
    return filteredTransactions.slice(-4).reverse()
  }, [filteredTransactions])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs Gastos</CardTitle>
            <CardDescription>Comparativa de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeVsExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ingresos" fill="#8884d8" />
                <Bar dataKey="gastos" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Gastos</CardTitle>
            <CardDescription>Por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progresión Mensual</CardTitle>
            <CardDescription>Balance a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyProgression}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="balance" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
            <CardDescription>Últimos movimientos en tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                  <span className={`font-bold ${transaction.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'ingreso' ? '+' : '-'}{transaction.amount} $
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas y Consejos</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Consejo del día</AlertTitle>
              <AlertDescription>
                Considera ahorrar el 20% de tus ingresos mensuales para alcanzar tus metas financieras más rápido.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Filtros</h2>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecciona un rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último mes</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button>Aplicar Filtros</Button>
        </div>
      </div>
    </div>
  )
}