# Design System Documentation

## Overview

This comprehensive design system provides a consistent foundation for building beautiful, accessible UI components across the DNC SaaS application. All design tokens are defined as CSS custom properties for easy maintenance and tenant theming.

## 🎨 Typography System

### Font Families

```css
/* Usage in CSS */
font-family: var(--font-primary);  /* Inter, Roboto, system fonts */
font-family: var(--font-mono);     /* JetBrains Mono, Fira Code, etc. */
font-family: var(--font-heading);  /* Poppins, then primary */
```

```tsx
// Usage in Tailwind classes
<div className="font-primary">Body text</div>
<h1 className="font-heading">Heading</h1>
<code className="font-mono">Code snippet</code>
```

### Font Weights

```css
font-weight: var(--font-weight-thin);        /* 100 */
font-weight: var(--font-weight-extralight);  /* 200 */
font-weight: var(--font-weight-light);       /* 300 */
font-weight: var(--font-weight-normal);      /* 400 */
font-weight: var(--font-weight-medium);      /* 500 */
font-weight: var(--font-weight-semibold);    /* 600 */
font-weight: var(--font-weight-bold);        /* 700 */
font-weight: var(--font-weight-extrabold);   /* 800 */
font-weight: var(--font-weight-black);       /* 900 */
```

### Font Sizes

```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
--font-size-6xl: 3.75rem;   /* 60px */
```

```tsx
// Example usage
<p style={{ fontSize: 'var(--font-size-sm)' }}>Small text</p>
<h1 style={{ fontSize: 'var(--font-size-4xl)' }}>Large heading</h1>
```

### Line Heights

```css
--line-height-tight: 1.25;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;
```

---

## 🎨 Color System

### Neutral Colors (RGB Format)

Use with `rgb()` or `rgba()` functions:

```css
/* Gray scale */
--color-gray-50: 249, 250, 251;
--color-gray-100: 243, 244, 246;
--color-gray-200: 229, 231, 235;
--color-gray-300: 203, 213, 225;
--color-gray-400: 156, 163, 175;
--color-gray-500: 107, 114, 128;
--color-gray-600: 75, 85, 99;
--color-gray-700: 55, 65, 81;
--color-gray-800: 31, 41, 55;
--color-gray-900: 17, 24, 39;
--color-gray-950: 3, 7, 18;
```

```tsx
// Usage
<div style={{ color: 'rgb(var(--color-gray-600))' }}>Text</div>
<div style={{ backgroundColor: 'rgba(var(--color-gray-100), 0.5)' }}>Semi-transparent</div>
```

### Primary Colors (Tenant Configurable)

```css
--color-primary-50: 239, 246, 255;
--color-primary-100: 219, 234, 254;
--color-primary-200: 191, 219, 254;
--color-primary-300: 147, 197, 253;
--color-primary-400: 96, 165, 250;
--color-primary-500: 59, 130, 246;
--color-primary-600: 37, 99, 235;
--color-primary-700: 29, 78, 216;
--color-primary-800: 30, 64, 175;
--color-primary-900: 30, 58, 138;
--color-primary-950: 23, 37, 84;
```

### Semantic Colors

```css
/* Success - Green */
--color-success: 34, 197, 94;
--color-success-foreground: 255, 255, 255;
--color-success-50: 240, 253, 244;
--color-success-500: 34, 197, 94;
--color-success-600: 22, 163, 74;

/* Warning - Orange */
--color-warning: 251, 146, 60;
--color-warning-foreground: 255, 255, 255;
--color-warning-50: 255, 251, 235;
--color-warning-500: 251, 146, 60;
--color-warning-600: 234, 88, 12;

/* Error - Red */
--color-error: 239, 68, 68;
--color-error-foreground: 255, 255, 255;
--color-error-50: 254, 242, 242;
--color-error-500: 239, 68, 68;
--color-error-600: 220, 38, 38;

/* Info - Blue */
--color-info: 59, 130, 246;
--color-info-foreground: 255, 255, 255;
--color-info-50: 239, 246, 255;
--color-info-500: 59, 130, 246;
--color-info-600: 37, 99, 235;
```

```tsx
// Examples
<div className="text-green-600" style={{ color: 'rgb(var(--color-success-600))' }}>Success message</div>
<div className="bg-red-50" style={{ backgroundColor: 'rgb(var(--color-error-50))' }}>Error container</div>
```

---

## 📏 Spacing System

```css
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
--spacing-32: 8rem;     /* 128px */
--spacing-40: 10rem;    /* 160px */
--spacing-48: 12rem;    /* 192px */
--spacing-56: 14rem;    /* 224px */
--spacing-64: 16rem;    /* 256px */
```

```tsx
// Usage
<div style={{ padding: 'var(--spacing-4)' }}>Padded container</div>
<div style={{ marginBottom: 'var(--spacing-6)' }}>Spaced section</div>
```

### Spacing Guidelines

- **Component Padding**: Use `--spacing-4` to `--spacing-6`
- **Section Margins**: Use `--spacing-8` to `--spacing-12`
- **Tight Spacing**: Use `--spacing-1` to `--spacing-3`
- **Loose Spacing**: Use `--spacing-16` and above

---

## 🔲 Border Radius System

```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-base: 0.25rem;   /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-full: 9999px;
```

```tsx
// Usage
<button style={{ borderRadius: 'var(--radius-md)' }}>Button</button>
<div style={{ borderRadius: 'var(--radius-2xl)' }}>Card</div>
```

---

## 🎭 Shadow System

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
```

```tsx
// Usage
<div style={{ boxShadow: 'var(--shadow-md)' }}>Card</div>
<div className="hover:shadow-lg" style={{ boxShadow: 'var(--shadow-lg)' }}>Hover card</div>
```

---

## ⚡ Animation System

### Durations

```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### Easing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Animation Classes

```tsx
// Fade animations
<div className="animate-fade-in">Fade in</div>
<div className="animate-fade-out">Fade out</div>

// Slide animations
<div className="animate-slide-in-up">Slide up</div>
<div className="animate-slide-in-down">Slide down</div>
<div className="animate-slide-in-left">Slide left</div>
<div className="animate-slide-in-right">Slide right</div>

// Scale animations
<div className="animate-scale-in">Scale in</div>
<div className="animate-scale-out">Scale out</div>

// Loop animations
<div className="animate-pulse">Pulse</div>
<div className="animate-spin">Spin</div>
<div className="animate-bounce">Bounce</div>
<div className="animate-wiggle">Wiggle</div>
```

### Animation Best Practices

1. **Micro-interactions**: Use `--duration-150` to `--duration-200`
2. **Page Transitions**: Use `--duration-300` to `--duration-500`
3. **Loading States**: Use `--duration-500` to `--duration-1000`
4. **Always use `ease-out` for hover states**
5. **Use `ease-in-out` for complex animations**

---

## 📐 Layout System

### Container Max Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Responsive Breakpoints

```css
--breakpoint-sm: 640px;   /* Small tablets and large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops and laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

### Z-Index Scale

```css
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
--z-toast: 1080;
```

---

## 🧩 Utility Classes

### Flexbox Utilities

```tsx
<div className="flex-center">
  {/* Centers content horizontally and vertically */}
</div>

<div className="flex-between">
  {/* Space between with vertical center alignment */}
</div>

<div className="flex-col">
  {/* Column flex direction */}
</div>
```

### Grid Utilities

```tsx
<div className="grid-base grid-cols-3">
  {/* 3-column grid with default gap */}
</div>

<div className="grid-cols-1">Single column</div>
<div className="grid-cols-2">Two columns</div>
<div className="grid-cols-3">Three columns</div>
<div className="grid-cols-4">Four columns</div>
<div className="grid-cols-12">12 columns</div>
```

### Text Utilities

```tsx
<p className="line-clamp-2">
  This text will be truncated to 2 lines with ellipsis
</p>

<p className="line-clamp-3">
  This text will be truncated to 3 lines with ellipsis
</p>
```

---

## 🎯 Component Patterns

### Button Components

```tsx
// Primary Button
<button className="btn-primary">
  Primary Action
</button>

// Secondary Button
<button className="btn-secondary">
  Secondary Action
</button>

// Ghost Button
<button className="btn-ghost">
  Tertiary Action
</button>
```

### Input Components

```tsx
// Base Input
<input 
  type="text" 
  className="input-base" 
  placeholder="Enter text..."
/>

// Custom styled input
<input
  type="email"
  style={{
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-base)',
  }}
/>
```

### Card Components

```tsx
// Base Card
<div className="card-base">
  <div className="card-header">
    <h3 className="card-title">Card Title</h3>
    <p className="card-description">Card description text</p>
  </div>
  <div>Card content</div>
</div>

// Hoverable Card
<div className="card-base card-hover">
  Hover for elevation effect
</div>

// Premium Gradient Card
<div className="fresh-card">
  Navy gradient border card
</div>

// Premium Alternative Card
<div className="fresh-card-alt">
  Emerald/Cyan gradient mesh card
</div>
```

---

## 🌙 Dark Mode Support

The design system automatically supports dark mode. All color tokens are overridden in `.dark` class:

```tsx
// Dark mode is controlled by the parent element
<div className="dark">
  {/* All child components will use dark mode colors */}
</div>
```

---

## 🎨 Complete Component Example

```tsx
import React from 'react';

const ExampleComponent = () => {
  return (
    <div 
      className="card-base card-hover animate-fade-in"
      style={{
        padding: 'var(--spacing-6)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div className="card-header">
        <h2 
          className="card-title"
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'rgb(var(--color-gray-900))',
          }}
        >
          Design System Example
        </h2>
        <p className="card-description line-clamp-2">
          This demonstrates the comprehensive design system with proper
          typography, spacing, colors, and animations.
        </p>
      </div>

      <div className="flex-between" style={{ marginBottom: 'var(--spacing-4)' }}>
        <div className="flex-center" style={{ gap: 'var(--spacing-2)' }}>
          <span 
            style={{ 
              color: 'rgb(var(--color-success))',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            Active
          </span>
        </div>
        <button className="btn-primary">
          Take Action
        </button>
      </div>

      <input
        type="text"
        className="input-base"
        placeholder="Search..."
        style={{ marginBottom: 'var(--spacing-4)' }}
      />

      <div 
        className="grid-base grid-cols-3"
        style={{ gap: 'var(--spacing-4)' }}
      >
        <div 
          style={{
            padding: 'var(--spacing-4)',
            backgroundColor: 'rgb(var(--color-primary-50))',
            borderRadius: 'var(--radius-lg)',
            transition: 'all var(--duration-200) var(--ease-out)',
          }}
        >
          Grid Item 1
        </div>
        <div 
          style={{
            padding: 'var(--spacing-4)',
            backgroundColor: 'rgb(var(--color-primary-50))',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          Grid Item 2
        </div>
        <div 
          style={{
            padding: 'var(--spacing-4)',
            backgroundColor: 'rgb(var(--color-primary-50))',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          Grid Item 3
        </div>
      </div>
    </div>
  );
};

export default ExampleComponent;
```

---

## 📝 Usage Tips

1. **Consistency**: Always use design tokens instead of hard-coded values
2. **Semantic Colors**: Use success/warning/error colors for appropriate states
3. **Spacing Scale**: Follow the spacing guidelines for consistent layouts
4. **Animation Timing**: Use appropriate durations for different interaction types
5. **Accessibility**: Ensure sufficient color contrast and focus states
6. **Theming**: Primary colors are tenant-configurable via CSS variables
7. **Performance**: Animations use CSS custom properties for better performance

---

## 🔄 Migration Guide

If migrating from hard-coded values:

```tsx
// Before
<div style={{ padding: '16px', borderRadius: '8px', fontSize: '14px' }}>

// After
<div style={{ 
  padding: 'var(--spacing-4)', 
  borderRadius: 'var(--radius-lg)', 
  fontSize: 'var(--font-size-sm)' 
}}>
```

```tsx
// Before
<div className="p-4 rounded-lg text-sm">

// After (still works with Tailwind, but design tokens are available)
<div className="p-4 rounded-lg text-sm">
```

---

## 🚀 Next Steps

1. Use the design tokens throughout your application
2. Create reusable component patterns using these foundations
3. Leverage the animation classes for micro-interactions
4. Customize theme colors for tenant branding
5. Build consistent, accessible user interfaces

For questions or additions to the design system, please consult the development team.
