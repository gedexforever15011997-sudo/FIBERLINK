# FiberLink Pro - Authentication Setup

## Sistema de Autenticación Implementado

Se ha implementado un sistema completo de autenticación con login, registro y roles de usuario.

### Características Implementadas

1. **Página de Login y Registro**
   - Los usuarios pueden registrarse con nombre, email y contraseña
   - Validación de contraseñas y confirmación
   - Mensajes de error claros

2. **Autenticación de Usuarios**
   - Los usuarios deben autenticarse para acceder al panel
   - Las sesiones se guardan en localStorage

3. **Rol de Administrador**
   - Los administradores pueden acceder al "Admin Panel"
   - Los administradores pueden crear, editar y eliminar usuarios
   - Los usuarios regulares no pueden acceder al panel de administración

4. **Gestión de Usuarios (Admin Panel)**
   - Crear nuevos usuarios
   - Editar usuarios existentes
   - Eliminar usuarios
   - Cambiar roles entre "User" y "Administrator"
   - Cambiar estado entre "Active" e "Inactive"

## Credenciales de Prueba

### Administrador Predeterminado
- **Email:** `admin@fiberlink.local`
- **Contraseña:** `admin123`

## Pasos para Probar

### 1. Ejecutar el Schema en Supabase
1. Ve a tu proyecto Supabase
2. Abre el SQL Editor
3. Copia el contenido de `supabase/schema.sql`
4. Ejecuta el script

Esto creará:
- Tabla `users` con soporte para autenticación
- Usuario administrador por defecto

### 2. Iniciar la Aplicación
1. Abre `index.html` en tu navegador
2. Deberías ver la página de login

### 3. Flujo de Prueba

#### Como Administrador:
1. Haz clic en "Sign in"
2. Usa las credenciales:
   - Email: `admin@fiberlink.local`
   - Contraseña: `admin123`
3. Deberías entrar al dashboard
4. En la barra lateral, verás "Admin Panel"
5. Haz clic para acceder al panel de administración

#### Crear un Nuevo Usuario:
1. En el Admin Panel, haz clic en "Add User"
2. Completa los datos:
   - Full Name: Tu nombre
   - Email: tu@email.com
   - Password: Tu contraseña (mín 6 caracteres)
   - Role: "User" (por defecto)
   - Status: "Active"
3. Haz clic en "Save User"

#### Cambiar a Administrador:
1. Haz clic en "Edit" en un usuario
2. Cambia el Role a "Administrator"
3. Haz clic en "Save User"

#### Probar como Usuario Regular:
1. Cierra sesión (botón en la esquina inferior del sidebar)
2. Haz clic en "Don't have an account? Create one"
3. Registra un nuevo usuario con email y contraseña
4. Inicia sesión con esa cuenta
5. Nota que no ves "Admin Panel" en la barra lateral

## Archivos Modificados/Creados

### Nuevos Archivos
- `pages/auth.js` - Página de autenticación (login/signup)
- `pages/admin.js` - Panel de administración
- `assets/css/auth.css` - Estilos para login/signup
- `assets/css/admin.css` - Estilos para admin panel

### Archivos Modificados
- `index.html` - Agregados scripts y CSS
- `services/supabase.js` - Agregadas funciones de autenticación
- `assets/js/app.js` - Lógica de protección de rutas y UI
- `supabase/schema.sql` - Agregado usuario administrador

## Estructura de Base de Datos

### Tabla `users`
```
- id (uuid, pk)
- name (text)
- email (text, unique)
- password_hash (text) - contraseña codificada en base64
- role (text) - 'user' o 'admin'
- status (text) - 'active' o 'inactive'
- created_at (timestamptz)
- updated_at (timestamptz)
```

## Notas de Seguridad

⚠️ **IMPORTANTE:** Este sistema usa codificación base64 para contraseñas en lugar de hash seguro. Para producción:
- Usar algoritmos de hash seguros (bcrypt, Argon2)
- Implementar HTTPS
- Agregar CSRF protection
- Usar cookies seguras y httpOnly
- Implementar rate limiting en login

## Próximas Mejoras Sugeridas

1. Implementar recuperación de contraseña
2. Agregar autenticación de dos factores (2FA)
3. Registrar auditoría de cambios de usuarios
4. Agregar permisos granulares por módulo
5. Implementar sesiones más seguras
