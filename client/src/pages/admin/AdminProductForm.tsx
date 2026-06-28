import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react"
import { adminService } from "../../services/admin.service"
import type { CreateProductData } from "../../services/admin.service"
import { menuService } from "../../services/menu.service"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { toast } from "sonner"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  available: z.boolean(),
})

type ProductFormValues = z.infer<typeof productSchema>

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditMode = !!id

  const [imagesList, setImagesList] = useState<string[]>([])
  const [imageUrlInput, setImageUrlInput] = useState("")

  // Query product data if in edit mode
  const { data: existingProduct, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["adminProductDetail", id],
    queryFn: () => menuService.getSingleProduct(id!),
    enabled: isEditMode,
  })

  // Query existing categories to populate suggestions
  const { data: categories } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: adminService.getCategories,
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      available: true,
    },
  })

  // Set form values on data load
  useEffect(() => {
    if (existingProduct) {
      reset({
        name: existingProduct.name,
        description: existingProduct.description || "",
        price: existingProduct.price,
        category: existingProduct.category,
        available: existingProduct.available,
      })
      setImagesList(existingProduct.images || [])
    }
  }, [existingProduct, reset])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateProductData) => adminService.createProduct(data),
    onSuccess: (newProduct) => {
      toast.success(`"${newProduct.name}" created successfully!`)
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] })
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] })
      navigate("/admin/products")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create product")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: CreateProductData }) =>
      adminService.updateProduct(productId, data),
    onSuccess: (updatedProduct) => {
      toast.success(`"${updatedProduct.name}" updated successfully!`)
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] })
      queryClient.invalidateQueries({ queryKey: ["adminProductDetail", id] })
      navigate("/admin/products")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update product")
    },
  })

  const onSubmit = (values: ProductFormValues) => {
    const payload: CreateProductData = {
      ...values,
      images: imagesList,
    }

    if (isEditMode) {
      updateMutation.mutate({ productId: id!, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleAddImageUrl = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!imageUrlInput.trim()) return

    // Simple URL validation
    if (!imageUrlInput.startsWith("http://") && !imageUrlInput.startsWith("https://") && !imageUrlInput.startsWith("/")) {
      toast.error("Please enter a valid image URL")
      return
    }

    setImagesList((prev) => [...prev, imageUrlInput.trim()])
    setImageUrlInput("")
  }

  const handleRemoveImageUrl = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index))
  }

  const isLoading = isLoadingProduct || createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 pb-16 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/admin/products")}
          className="border-border hover:bg-surface-container h-9 w-9 rounded-full text-on-surface"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-xs text-on-surface-variant">
            {isEditMode ? "Modify details of an existing menu item" : "Create a new delicious dish for customers"}
          </p>
        </div>
      </div>

      {isLoadingProduct ? (
        <div className="min-h-[40vh] bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-on-surface-variant font-medium">Fetching product info...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Card: Basic Info */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-md font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-on-surface-variant">Product Name *</label>
                <Input
                  {...register("name")}
                  placeholder="e.g., Double Cheese Margherita"
                  className="bg-surface-container border-outline-variant/30 text-on-surface focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                />
                {errors.name && (
                  <p className="text-[10px] text-error font-semibold mt-0.5">{errors.name.message}</p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Price (₹) *</label>
                <Input
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="e.g., 299"
                  className="bg-surface-container border-outline-variant/30 text-on-surface focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                />
                {errors.price && (
                  <p className="text-[10px] text-error font-semibold mt-0.5">{errors.price.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant">Category *</label>
                <div className="relative">
                  <Input
                    {...register("category")}
                    placeholder="e.g., Pizza, Burgers, Drinks"
                    className="bg-surface-container border-outline-variant/30 text-on-surface focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                    list="category-suggestions"
                  />
                  <datalist id="category-suggestions">
                    {categories?.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                {errors.category && (
                  <p className="text-[10px] text-error font-semibold mt-0.5">{errors.category.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-on-surface-variant">Description</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Describe the ingredients, taste, and size details..."
                  className="w-full text-sm bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3"
                />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center gap-3 pt-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="available"
                  {...register("available")}
                  className="w-4.5 h-4.5 text-primary border-outline-variant/30 rounded focus:ring-primary bg-surface-container"
                />
                <label htmlFor="available" className="text-xs font-bold text-on-surface select-none cursor-pointer">
                  Available in stock (allow customers to order this item)
                </label>
              </div>
            </div>
          </div>

          {/* Card: Images */}
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 md:p-6 space-y-4">
            <h2 className="text-md font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <ImageIcon className="w-4.5 h-4.5 text-primary" />
              Product Images
            </h2>

            <div className="space-y-4">
              {/* Image Input field */}
              <div className="flex gap-2">
                <Input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Paste image URL (e.g., https://images.unsplash.com/...)"
                  className="bg-surface-container border-outline-variant/30 text-on-surface focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                />
                <Button
                  onClick={handleAddImageUrl}
                  type="button"
                  variant="outline"
                  className="border-primary/20 text-primary hover:bg-primary/10 rounded-xl flex items-center gap-1.5 whitespace-nowrap text-xs font-bold px-4"
                >
                  <Plus className="w-4 h-4" /> Add URL
                </Button>
              </div>

              {/* Image previews grid */}
              {imagesList.length === 0 ? (
                <div className="border border-dashed border-outline-variant/30 rounded-2xl p-6 text-center text-xs text-on-surface-variant">
                  No images added yet. Paste a URL and click Add to preview it.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imagesList.map((url, index) => (
                    <div key={index} className="group relative aspect-video bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button
                          onClick={() => handleRemoveImageUrl(index)}
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:text-red-400 hover:bg-white/10 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => navigate("/admin/products")}
              className="border-border hover:bg-surface-container px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-2 px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? "Save Changes" : "Create Product"}
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
