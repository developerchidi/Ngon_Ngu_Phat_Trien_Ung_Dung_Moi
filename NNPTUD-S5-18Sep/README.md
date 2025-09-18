# Posts Management System

## 🚀 Features

### ✅ **Fetch API Integration**
- Sử dụng `fetch()` để đọc dữ liệu từ Express server
- Real-time data loading với error handling
- Responsive UI với loading states

### 🔍 **Advanced Search với Gợi ý**
- Search theo title với autocomplete suggestions
- Debounced search để tối ưu performance
- Highlight matching text trong suggestions
- Server-side search với fallback client-side

### 🎚️ **Slider Filter cho Views**
- Dual-range slider cho min/max views
- Real-time filtering khi thay đổi slider
- Visual feedback với value display
- Responsive design cho mobile

### 📊 **Statistics Dashboard**
- Total posts count
- Filtered posts count  
- Average views calculation
- Real-time updates

## 🛠️ Setup & Usage

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
node main.js
```
Server sẽ chạy tại: `http://localhost:3000`

### 3. Open Frontend
Mở file `index.html` trong browser hoặc serve static files

## 📡 API Endpoints

### GET `/posts`
- **Query Parameters:**
  - `title_like`: Search posts containing text
  - `views_gte`: Minimum views filter
  - `views_lte`: Maximum views filter
  - `title`: Exact title match

### GET `/posts/:id`
- Get specific post by ID

## 🎨 UI Features

- **Modern Design**: Gradient backgrounds, card layouts
- **Responsive**: Mobile-friendly design
- **Interactive**: Hover effects, smooth transitions
- **Accessible**: Keyboard navigation support

## 🔧 Technical Details

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Backend**: Express.js with CORS support
- **Data**: JSON file-based storage
- **Search**: Server-side filtering với client-side fallback
- **Performance**: Debounced search, efficient DOM updates

## 📱 Mobile Support

- Responsive grid layout
- Touch-friendly sliders
- Optimized for mobile screens
- Swipe gestures support