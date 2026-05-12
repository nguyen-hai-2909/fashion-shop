su# System Prompt — Fashion & Accessories E-commerce (MongoDB)

## Tech Stack
- Database: MongoDB (Mongoose ODM)
- Collections: users, products, orders, discounts, categories

---

## Triết lý thiết kế

- **Embed** khi dữ liệu luôn được đọc cùng nhau (variants trong product, addresses trong user, items trong order)
- **Reference (_id)** khi dữ liệu được đọc độc lập
- `orders.items` luôn lưu **snapshot đầy đủ** tại thời điểm đặt hàng (tên, ảnh, giá, sku) — không bao giờ join lại product để lấy giá
- Mọi thay đổi trạng thái đơn hàng đều append vào `status_logs` (không overwrite)

---

## Collection: users

```js
{
  _id: ObjectId,
  email: String,          // unique index
  phone: String,
  password_hash: String,
  full_name: String,
  avatar_url: String,
  role: String,           // "customer" | "admin"

  addresses: [
    {
      _id: ObjectId,
      label: String,           // "Nhà", "Văn phòng"
      recipient_name: String,
      phone: String,
      address: String,
      district: String,
      city: String,
      is_default: Boolean
    }
  ],

  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```js
{ email: 1 }  // unique
{ phone: 1 }
```

---

## Collection: products

```js
{
  _id: ObjectId,
  name: String,
  slug: String,           // unique index — dùng cho URL
  description: String,
  category: String,       // slug của category, vd: "ao-nam"
  brand: String,
  gender: String,         // "male" | "female" | "unisex"
  tags: [String],         // ["polo", "casual", "summer"]
  status: String,         // "active" | "draft" | "archived"
  is_featured: Boolean,

  images: [
    {
      url: String,
      alt: String,
      position: Number
    }
  ],

  // Mỗi combination color + size = 1 variant
  variants: [
    {
      _id: ObjectId,
      sku: String,          // unique toàn hệ thống, vd: "POLO-TRANG-S"
      color: {
        name: String,       // "Trắng"
        hex: String         // "#FFFFFF"
      },
      size: String,         // "S" | "M" | "L" | "XL" | "XXL"
      price: Number,        // VNĐ
      compare_at_price: Number | null,  // giá gốc để hiện gạch ngang, null nếu không giảm
      inventory: Number,    // số lượng tồn kho
      image_url: String,    // ảnh riêng của màu này (có thể null)
      is_active: Boolean
    }
  ],

  published_at: Date,
  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```js
{ slug: 1 }                       // unique
{ category: 1, status: 1 }
{ tags: 1 }
{ "variants.sku": 1 }
{ "variants._id": 1 }
{ status: 1, is_featured: 1 }
```

---

## Collection: orders

```js
{
  _id: ObjectId,
  order_number: String,   // unique, vd: "ORD-20241024-0001"
  user_id: ObjectId,      // ref → users
  user_email: String,     // snapshot

  // Trạng thái: "pending" → "confirmed" → "shipping" → "delivered"
  //             "pending" → "cancelled"
  //             "confirmed" → "cancelled"
  status: String,         // "pending" | "confirmed" | "shipping" | "delivered" | "cancelled"

  // Lịch sử thay đổi trạng thái — append only, không xóa
  status_logs: [
    {
      status: String,
      at: Date,
      note: String        // vd: "Admin xác nhận", "Khách hủy đơn"
    }
  ],

  // Snapshot địa chỉ tại thời điểm đặt hàng
  shipping_address: {
    recipient_name: String,
    phone: String,
    address: String,
    district: String,
    city: String
  },

  // Snapshot sản phẩm tại thời điểm đặt hàng — KHÔNG join lại product
  items: [
    {
      product_id: ObjectId,    // ref — chỉ dùng để link back nếu cần
      variant_id: ObjectId,    // ref
      product_name: String,    // snapshot
      variant_title: String,   // snapshot, vd: "Trắng / S"
      sku: String,             // snapshot
      image_url: String,       // snapshot
      quantity: Number,
      unit_price: Number,      // snapshot giá tại thời điểm mua
      subtotal: Number         // quantity × unit_price
    }
  ],

  payment: {
    method: String,     // "cod" | "bank_transfer" | "momo" | "vnpay"
    status: String,     // "pending" | "paid" | "failed"
    paid_at: Date | null
  },

  // Mã giảm giá (nếu có)
  discount: {
    code: String,
    amount: Number
  } | null,

  // Tổng tiền
  subtotal: Number,         // tổng items trước giảm giá
  discount_amount: Number,  // số tiền được giảm
  shipping_fee: Number,
  total: Number,            // subtotal - discount_amount + shipping_fee

  note: String | null,
  cancel_reason: String | null,

  created_at: Date,
  updated_at: Date
}
```

**Indexes:**
```js
{ order_number: 1 }                    // unique
{ user_id: 1, created_at: -1 }        // lịch sử đơn hàng của user
{ status: 1, created_at: -1 }         // admin lọc đơn theo trạng thái
{ "payment.status": 1 }
```

---

## Collection: discounts

```js
{
  _id: ObjectId,
  code: String,             // unique index, uppercase, vd: "SALE20"
  description: String,      // "Giảm 20% toàn bộ đơn hàng"
  type: String,             // "percentage" | "fixed_amount" | "free_shipping"
  value: Number,            // 20 = 20% hoặc 50000 = giảm 50k (với free_shipping thì value = 0)
  min_order_amount: Number | null,  // đơn tối thiểu để áp dụng, null = không giới hạn
  usage_limit: Number | null,       // tổng lượt dùng tối đa, null = không giới hạn
  usage_count: Number,      // đếm số lần đã dùng (tăng mỗi khi order thành công)
  once_per_user: Boolean,   // true = mỗi user chỉ dùng 1 lần
  is_active: Boolean,
  starts_at: Date,
  ends_at: Date | null,     // null = không hết hạn

  created_at: Date
}
```

**Indexes:**
```js
{ code: 1 }  // unique
{ is_active: 1, ends_at: 1 }
```

---

## Collection: categories

```js
{
  _id: ObjectId,
  name: String,           // "Áo Nam"
  slug: String,           // unique index, vd: "ao-nam"
  parent_id: ObjectId | null,  // null = root category
  image_url: String | null,
  sort_order: Number,
  is_active: Boolean
}

// Ví dụ cấu trúc cây:
// Thời trang Nam  (parent_id: null)
//   └─ Áo Nam     (parent_id: → "Thời trang Nam")
//       └─ Áo Polo (parent_id: → "Áo Nam")
// Phụ kiện        (parent_id: null)
//   └─ Thắt lưng  (parent_id: → "Phụ kiện")
```

**Indexes:**
```js
{ slug: 1 }       // unique
{ parent_id: 1 }
```

---

## Order status flow

```
pending → confirmed → shipping → delivered
pending → cancelled
confirmed → cancelled
```

Mỗi khi đổi status, append vào `status_logs`:
```js
order.status_logs.push({ status: "confirmed", at: new Date(), note: "Admin xác nhận" })
order.status = "confirmed"
```

---

## Business rules

1. **Tạo order**: Luôn snapshot `product_name`, `variant_title`, `sku`, `image_url`, `unit_price` từ product vào `items` — không bao giờ reference lại để lấy giá
2. **Tồn kho**: Khi tạo order thành công, trừ `variants.inventory` trong products bằng `$inc`
3. **Discount**: Khi áp mã, tăng `usage_count` bằng `$inc`. Kiểm tra `usage_limit`, `once_per_user`, `starts_at`, `ends_at`, `is_active` trước khi áp dụng
4. **Order number**: Format `ORD-YYYYMMDD-XXXX`, XXXX là sequence tăng dần trong ngày
5. **Hủy đơn**: Chỉ cho phép hủy khi `status` là `pending` hoặc `confirmed`. Khi hủy, hoàn lại tồn kho bằng `$inc`
6. **Default address**: Mỗi user chỉ có 1 `is_default: true` trong mảng `addresses`
