'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {  Trash2, Upload, Edit, X } from 'lucide-react'
import Dashboard from './dashboard'
import { Image } from "@nextui-org/image"
import { Button } from "@nextui-org/react"


type Transaction = {
  id: number
  type: 'ingreso' | 'gasto'
  amount: number
  category: string
  description: string
  date: string
}

type WishlistItem = {
  id: number
  title: string
  description: string
  estimatedCost: number
  imageUrl: string
}

type InventoryItem = {
  id: number
  name: string
  unitPrice: number
  quantity: number
  imageUrl: string
}

export default function FinanzasPersonales() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'ingreso',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [newWishlistItem, setNewWishlistItem] = useState<Partial<WishlistItem>>({
    title: '',
    description: '',
    estimatedCost: 0,
    imageUrl: ''
  })
  const [newInventoryItem, setNewInventoryItem] = useState<Partial<InventoryItem>>({
    name: '',
    unitPrice: 0,
    quantity: 0,
    imageUrl: ''
  })
  const [dragActive, setDragActive] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions')
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions))

    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist))

    const savedInventory = localStorage.getItem('inventory')
    if (savedInventory) setInventory(JSON.parse(savedInventory))

    const savedCategories = localStorage.getItem('categories')
    if (savedCategories) setCategories(JSON.parse(savedCategories))
  }, [])

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory))
  }, [inventory])

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories))
  }, [categories])

  const handleAddTransaction = () => {
    if (newTransaction.amount && newTransaction.category && newTransaction.description) {
      const { id, ...transactionData } = newTransaction as Transaction;
      setTransactions([...transactions, { id: Date.now(), ...transactionData }]);
      if (!categories.includes(newTransaction.category)) {
        setCategories([...categories, newTransaction.category])
      }
      setNewTransaction({
        type: 'ingreso',
        amount: 0,
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }

  const handleAddWishlistItem = () => {
    if (newWishlistItem.title && newWishlistItem.estimatedCost) {
      const { id, ...wishlistItemData } = newWishlistItem as WishlistItem;
      setWishlist([...wishlist, { id: Date.now(), ...wishlistItemData }]);
      setNewWishlistItem({
        title: '',
        description: '',
        estimatedCost: 0,
        imageUrl: ''
      });
    }
  }

  const handleAddInventoryItem = () => {
    if (newInventoryItem.name && newInventoryItem.unitPrice && newInventoryItem.quantity) {
      const { id, ...inventoryItemData } = newInventoryItem as InventoryItem;
      setInventory([...inventory, { id: Date.now(), ...inventoryItemData }]);
      setNewInventoryItem({
        name: '',
        unitPrice: 0,
        quantity: 0,
        imageUrl: ''
      });
    }
  }

  const handleDeleteWishlistItem = (id: number) => {
    setWishlist(wishlist.filter(item => item.id !== id))
  }

  const handleDeleteInventoryItem = (id: number) => {
    setInventory(inventory.filter(item => item.id !== id))
  }

  const handleSellInventoryItem = (id: number) => {
    const item = inventory.find(item => item.id === id)
    if (item) {
      const quantitySold = prompt(`¿Cuántas unidades de ${item.name} has vendido?`)
      if (quantitySold && !isNaN(Number(quantitySold)) && Number(quantitySold) <= item.quantity) {
        const soldQuantity = Number(quantitySold)
        const totalSale = item.unitPrice * soldQuantity

        // Actualizar inventario
        setInventory(inventory.map(invItem => {
          if (invItem.id === id) {
            const newQuantity = invItem.quantity - soldQuantity
            return newQuantity > 0 ? { ...invItem, quantity: newQuantity } : null
          }
          return invItem
        }).filter(Boolean) as InventoryItem[])

        // Agregar transacción de venta
        setTransactions([...transactions, {
          id: Date.now(),
          type: 'ingreso',
          amount: totalSale,
          category: 'Venta',
          description: `Venta de ${soldQuantity} ${item.name}`,
          date: new Date().toISOString().split('T')[0]
        }])

        alert(`Venta registrada: ${soldQuantity} ${item.name} por $${totalSale.toFixed(2)}`)
      } else {
        alert('Cantidad inválida o insuficiente stock')
      }
    }
  }

  const handleEditInventoryItem = (id: number) => {
    const item = inventory.find(item => item.id === id)
    if (item) {
      setEditingItemId(id)
      setNewInventoryItem({ ...item })
    }
  }

  const handleUpdateInventoryItem = () => {
    if (editingItemId && newInventoryItem.name && newInventoryItem.unitPrice && newInventoryItem.quantity) {
      setInventory(inventory.map(item => 
        item.id === editingItemId ? { ...item, ...newInventoryItem as InventoryItem } : item
      ))
      setEditingItemId(null)
      setNewInventoryItem({
        name: '',
        unitPrice: 0,
        quantity: 0,
        imageUrl: ''
      })
    }
  }

  const handleDeleteCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category))
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    if (files && files[0]) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewWishlistItem(prev => ({ ...prev, imageUrl: e.target?.result as string }))
        setNewInventoryItem(prev => ({ ...prev, imageUrl: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const formatNumber = (value: string) => {
    let numericValue = value.replace(/[^\d.]/g, '');
    const parts = numericValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    numericValue = parts.join('.');
    return numericValue;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Finanzas Personales</h1>
      
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Ingresos/Gastos</TabsTrigger>
          <TabsTrigger value="wishlist">Lista de Deseos</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard transactions={transactions} />
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Ingreso/Gasto</CardTitle>
              <CardDescription>Registra tus transacciones financieras</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction-type">Tipo</Label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value) => setNewTransaction({...newTransaction, type: value as 'ingreso' | 'gasto'})}
                    >
                      <SelectTrigger id="transaction-type">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ingreso">Ingreso</SelectItem>
                        <SelectItem value="gasto">Gasto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction-amount">Monto</Label>
                    <Input
                      id="transaction-amount"
                      type="number"
                      value={newTransaction.amount || ''}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                      placeholder="0.00$"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction-category">Categoría</Label>
                    <Select
                      value={newTransaction.category}
                      onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                    >
                      <SelectTrigger id="transaction-category">
                        <SelectValue placeholder="Selecciona o escribe una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category, index) => (
                          <SelectItem key={index} value={category}>
                            <div className="flex justify-between items-center">
                              <span>{category}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleDeleteCategory(category)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem value="nueva">
                          <Input
                            placeholder="Nueva categoría"
                            onChange={(e) => {
                              if (e.target.value && !categories.includes(e.target.value)) {
                                setCategories([...categories, e.target.value])
                                setNewTransaction({...newTransaction, category: e.target.value})
                              }
                            }}
                          />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction-date">Fecha</Label>
                    <Input
                      id="transaction-date"
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-description">Descripción</Label>
                  <Input
                    id="transaction-description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    placeholder="Describe la transacción"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddTransaction}>Agregar Transacción</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Deseo</CardTitle>
                <CardDescription>Añade un nuevo ítem a tu lista de deseos</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wishlist-title">Título</Label>
                    <Input
                      id="wishlist-title"
                      value={newWishlistItem.title}
                      onChange={(e) => setNewWishlistItem({...newWishlistItem, title: e.target.value})}
                      placeholder="Ej: Nuevo smartphone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wishlist-description">Descripción</Label>
                    <Input
                      id="wishlist-description"
                      value={newWishlistItem.description}
                      onChange={(e) => setNewWishlistItem({...newWishlistItem, description: e.target.value})}
                      placeholder="Describe tu deseo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wishlist-cost">Costo Estimado</Label>
                    <Input
                      id="wishlist-cost"
                      type="text"
                      value={formatNumber(String(newWishlistItem.estimatedCost))}
                      onChange={(e) => setNewWishlistItem({...newWishlistItem, estimatedCost: parseFloat(e.target.value.replace(/[^\d.-]/g, ''))})}
                      placeholder="$0.00"
                    />
                  </div>
                  <div 
                    className={`space-y-2 p-4 border-2 border-dashed rounded-md ${dragActive ? 'border-primary' : 'border-gray-300'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex items-center justify-center">
                      {newWishlistItem.imageUrl ? (
                        <Image
                          isZoomed
                          width={240}
                          src={newWishlistItem.imageUrl}
                          alt="Preview"
                          className="max-w-full h-auto max-h-48 rounded-md"
                        />
                      ) : (
                        <div className="text-center flex flex-col items-center">
                          <label htmlFor="wishlist-image" className="mx-auto">
                            <Upload className="h-12 w-12 text-gray-400" />
                            Upload
                          </label>
                          <p className="mt-1 text-sm text-gray-600">Arrastra una imagen o haz clic para seleccionar</p>
                        </div>
                      )}
                    </div>
                    <Input
                      id="wishlist-image"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  color='primary' variant="shadow"
                  radius='full'
                  className="bg-gradient-to-bl from-[#03001e] via-[#7303c0] via-[#ec38bc] to-[#fdeff9] text-black shadow-lg"
                  onClick={handleAddWishlistItem}
                >
                  Agregar a la Lista de Deseos
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Lista de Deseos</CardTitle>
                <CardDescription>Tus metas y deseos financieros</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full pr-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 mb-4">
                      <div className="flex-shrink-0 h-20 w-20">
                        <Image
                          isZoomed
                          width={240}
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="h-full w-full object-cover rounded-md" 
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <p className="text-sm font-medium">Costo estimado: 
                         {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(item.estimatedCost)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteWishlistItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingItemId ? 'Editar Producto' : 'Agregar Producto al Inventario'}</CardTitle>
                <CardDescription>{editingItemId ? 'Modifica los detalles del producto' : 'Registra los productos que vendes'}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inventory-name">Nombre del Producto</Label>
                    <Input
                      id="inventory-name"
                      value={newInventoryItem.name}
                      onChange={(e) => setNewInventoryItem({...newInventoryItem, name: e.target.value})}
                      placeholder="Ej: Camiseta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inventory-price">Precio Unitario</Label>
                    <Input
                      id="inventory-price"
                      type="number"
                      value={newInventoryItem.unitPrice || ''}
                      onChange={(e) => setNewInventoryItem({...newInventoryItem, unitPrice: parseFloat(e.target.value)})}
                      placeholder="0.00$"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inventory-quantity">Cantidad</Label>
                    <Input
                      id="inventory-quantity"
                      type="number"
                      value={newInventoryItem.quantity || ''}
                      onChange={(e) => setNewInventoryItem({...newInventoryItem, quantity: parseInt(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                  <div 
                    className={`space-y-2 p-4 border-2 border-dashed rounded-md ${dragActive ? 'border-primary' : 'border-gray-300'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex items-center justify-center">
                      {newInventoryItem.imageUrl ? (
                        <Image
                          isZoomed
                          width={240}
                          src={newInventoryItem.imageUrl}
                          alt="Preview"
                          className="max-w-full h-auto max-h-48 rounded-md"
                        />
                      ) : (
                        <div className="text-center flex flex-col items-center">
                          <label htmlFor="inventory-image" className="mx-auto">
                            <Upload className="h-12 w-12 text-gray-400" />
                            Upload
                          </label>
                          <p className="mt-1 text-sm text-gray-600">Arrastra una imagen o haz clic para seleccionar</p>
                        </div>
                      )}
                    </div>
                    <Input
                      id="inventory-image"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                {editingItemId ? (
                  <Button onClick={handleUpdateInventoryItem}>Actualizar Producto</Button>
                ) : (
                  <Button onClick={handleAddInventoryItem}>Agregar al Inventario</Button>
                )}
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Inventario de Productos</CardTitle>
                <CardDescription>Tus productos en stock</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full pr-4">
                  {inventory.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 mb-4">
                      <div className="flex-shrink-0 h-20 w-20">
                        <Image
                          isZoomed
                          width={240}
                          src={item.imageUrl || "/placeholder.svg"} 
                          alt={item.name} 
                          className="h-full w-full object-cover rounded-md" 
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-sm font-medium">Precio unitario: 
                         {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(item.unitPrice)}
                        </p>
                        <p className="text-sm">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-medium">Valor total: 
                         {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'COP' }).format(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button size="sm" onClick={() => handleSellInventoryItem(item.id)}>Vender</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditInventoryItem(item.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteInventoryItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}