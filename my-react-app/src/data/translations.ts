// ─────────────────────────────────────────────────────────────────────────────
// GastroFlow – centralised translations
// Usage:  const { language } = useApp();
//         const t = translations[language];
// ─────────────────────────────────────────────────────────────────────────────

export const translations = {
  RO: {
    // ── Header ───────────────────────────────────────────────────────────────
    header: {
      reservation: 'Rezervare',
      order: 'Comandă',
      menu: 'Meniu',
      career: 'Cariere',
      login: 'Autentificare',
      logout: 'Deconectare',
      searchPlaceholder: 'Caută preparate...',
    },

    // ── Footer ───────────────────────────────────────────────────────────────
    footer: {
      aboutTitle: 'Despre noi',
      aboutText:
        'GastroFlow oferă experiențe culinare premium cu meniuri atent selecționate și servicii excepționale.',
      contactTitle: 'Contact',
      email: 'Email: info@gastroflow.md',
      phone: 'Telefon: +373 22 123 456',
      address: 'Adresă: Chișinău, Moldova',
      quickLinksTitle: 'Linkuri rapide',
      reservation: 'Rezervare',
      orderOnline: 'Comandă online',
      menu: 'Meniu',
      career: 'Cariere',
      feedback: 'Feedback',
      termsTitle: 'Termeni',
      privacyPolicy: 'Politică de confidențialitate',
      termsOfService: 'Termeni de utilizare',
      cookiePolicy: 'Politică cookies',
      copyright: '© 2026 GastroFlow. Toate drepturile rezervate.',
    },

    // ── Home – HeroCarousel ───────────────────────────────────────────────────
    home: {
      orderNow: 'Comandă acum',
      slides: [
        { title: 'Fripturi Premium', description: 'Cele mai fine bucăți, perfect grilate' },
        { title: 'Paste Artizanale', description: 'Preparate manual cu tradiție italiană' },
        { title: 'Deserturi Elegante', description: 'Finaluri dulci de neuitat' },
        { title: 'Fructe de mare proaspete', description: 'Excelență din ocean pe farfurie' },
        { title: 'Burgeri Gourmet', description: 'Mâncare confortabilă la nivel superior' },
      ],
      // MenuSection
      menuTitle: 'Meniul nostru',
      menuSubtitle: 'Descoperă selecția noastră de preparate premium',
      searchResultsTitle: 'Rezultate căutare',
      searchResultsFor: 'Se afișează rezultate pentru',
      noResults: 'Nu au fost găsite rezultate',
      loadingMenu: 'Se încarcă meniul...',
    },

    // ── Menu Page ────────────────────────────────────────────────────────────
    menu: {
      title: 'Meniul nostru',
      showing: 'Se afișează',
      of: 'din',
      items: 'preparate',
      searchPlaceholder: 'Caută după denumire sau ingredient...',
      categoriesTitle: 'Categorii',
      filtersTitle: 'Filtre',
      dietary: 'Dietetic',
      ingredients: 'Ingrediente',
      searchIngredients: 'Caută ingrediente...',
      priceRange: 'Interval de preț',
      resetFilters: 'Resetează filtrele',
      loadingMenu: 'Se încarcă meniul...',
      loadError: 'Nu s-a putut încărca meniul. Încearcă din nou.',
      retry: 'Reîncearcă',
      noMatch: 'Niciun preparat nu corespunde filtrelor',
      ingredientsLabel: 'Ingrediente:',
    },

    // ── Order Page ───────────────────────────────────────────────────────────
    order: {
      title: 'Gestionare comenzi',
      selectType: 'Selectează tipul comenzii',
      orderSummary: 'Sumar comandă',
      placeOrder: 'Plasează comanda',
      browseMenu: 'Vezi meniu',
      noCartItems: 'Niciun articol în coș. Vizitează meniul pentru a adăuga.',
      yourOrders: 'Comenzile tale',
      noOrders: 'Nu au fost găsite comenzi',
      cancel: 'Anulează',
      cancelConfirm: 'Ești sigur că vrei să anulezi această comandă?',
      deliveryAddress: 'Adresă de livrare',
      deliveryPlaceholder: 'Introdu adresa completă de livrare...',
      estimatedTime: 'Timp estimat:',
      orderTypes: {
        delivery: { label: 'Livrare', description: 'Livrăm la ușa ta' },
        takeaway: { label: 'Ridicare', description: 'Ridici de la restaurant' },
        dineIn: { label: 'La masă', description: 'Servire la restaurant' },
      },
      statusLabels: {
        draft: 'Creat',
        confirmed: 'Comandă confirmată',
        'in-preparation': 'În preparare',
        ready: 'Gata',
        delivered: 'Livrat',
      },
      estimatedTimes: {
        confirmed: '30-40 de minute',
        draft: 'Se așteaptă trimiterea la bucătărie',
        'in-preparation': '15-20 de minute',
        other: '5 minute',
      },
      successMsg: '🎉 Comanda ta a fost plasată cu succes!',
      errorCart: 'Coșul tău este gol. Adaugă articole din meniu înainte de a plasa comanda.',
      errorAddress: 'Te rugăm să introduci adresa de livrare.',
    },

    // ── Reservation Page ─────────────────────────────────────────────────────
    reservation: {
      title: 'Rezervă o masă',
      subtitle: 'Rezervă-ți experiența culinară alături de noi',
      date: 'Data',
      time: 'Ora',
      selectTime: 'Selectează ora',
      numberOfGuests: 'Număr de persoane',
      guest: 'Persoană',
      guests: 'Persoane',
      fullName: 'Nume complet',
      phoneNumber: 'Număr de telefon',
      specialRequests: 'Cerințe speciale (opțional)',
      specialRequestsPlaceholder:
        'Restricții alimentare, alergii sau ocazii speciale...',
      confirmReservation: 'Confirmă rezervarea',
      cancel: 'Anulează',
      successWithTable:
        'Rezervare trimisă cu succes! O masă a fost marcată ca rezervată.',
      successNoTable:
        'Rezervare trimisă cu succes! Vă vom confirma în scurt timp.',
    },

    // ── Cart Page ────────────────────────────────────────────────────────────
    cart: {
      title: 'Coș de cumpărături',
      emptyTitle: 'Coșul tău este gol',
      emptySubtitle: 'Adaugă preparate delicioase pentru a începe!',
      browseMenu: 'Vezi meniu',
      subtotalLabel: 'Subtotal:',
      orderSummary: 'Sumar comandă',
      subtotal: 'Subtotal',
      tax: 'TVA (10%)',
      total: 'Total',
      paymentMethod: 'Metodă de plată',
      card: 'Card credit/debit',
      cash: 'Numerar la livrare',
      checkout: 'Continuă spre plată',
      continueShopping: 'Continuă cumpărăturile',
      clearCart: 'Golește coșul',
    },

    // ── Feedback Page ────────────────────────────────────────────────────────
    feedback: {
      title: 'Feedback',
      subtitle: 'Împărtășește-ți gândurile cu noi',
      name: 'Nume',
      namePlaceholder: 'Numele tău',
      email: 'Email',
      message: 'Mesaj',
      messagePlaceholder: 'Scrie feedback-ul tău aici...',
      submit: 'Trimite',
      sending: 'Se trimite...',
      successMessage: 'Îți mulțumim pentru feedback!',
      errors: {
        name: 'Numele este obligatoriu.',
        email: 'Email-ul este obligatoriu.',
        message: 'Mesajul este obligatoriu.',
      },
    },

    // ── Account Page ─────────────────────────────────────────────────────────
    account: {
      title: 'Contul meu',
      personalInfo: 'Informații personale',
      dashboard: 'Panou de control',
      myOrders: 'Comenzile mele',
      reservations: 'Rezervări',
      logout: 'Deconectare',
      personalInfoTitle: 'Informații personale',
      fullName: 'Nume complet',
      email: 'Email',
      phoneNumber: 'Număr de telefon',
      address: 'Adresă',
      changePassword: 'Schimbă parola',
      currentPassword: 'Parola curentă',
      newPassword: 'Parolă nouă',
      confirmNewPassword: 'Confirmă parola nouă',
      saveChanges: 'Salvează modificările',
      ordersTitle: 'Istoricul comenzilor',
      noOrders: 'Nicio comandă încă.',
      reservationsTitle: 'Rezervările mele',
      noReservations: 'Nicio rezervare încă.',
      total: 'Total',
      table: 'Masă',
      at: 'la',
      guests: 'persoane',
      profileUpdated: 'Profil actualizat cu succes!',
    },

    // ── Login Page ───────────────────────────────────────────────────────────
    login: {
      title: 'Bine ai revenit',
      subtitle: 'Autentifică-te în contul tău',
      client: 'Client',
      staff: 'Personal',
      email: 'Email',
      password: 'Parolă',
      signIn: 'Autentificare',
      noAccount: 'Nu ai cont?',
      register: 'Înregistrare',
      backToHome: 'Înapoi acasă',
      staffEmailPlaceholder:
        'waiter@gastroflow.md / cook@gastroflow.md / manager@gastroflow.md',
      clientEmailPlaceholder: 'adresa@email.com',
    },

    // ── Career Page ──────────────────────────────────────────────────────────
    career: {
      title: 'Alătură-te echipei noastre',
      subtitle: 'Fii parte din familia GastroFlow',
      requirements: 'Cerințe:',
      applicationFormTitle: 'Formular de candidatură',
      positionLabel: 'Poziție aplicată',
      selectPosition: 'Selectează o poziție',
      fullName: 'Nume complet',
      email: 'Email',
      phoneNumber: 'Număr de telefon',
      uploadCV: 'Încarcă CV',
      coverLetter: 'Scrisoare de intenție / Mesaj',
      coverLetterPlaceholder: 'Spune-ne de ce ai fi potrivit pentru echipa noastră...',
      submitApplication: 'Trimite candidatura',
      cancel: 'Anulează',
      successAlert: 'Candidatura a fost trimisă cu succes! Te vom contacta în curând.',
      positions: [
        {
          title: 'Ospătar',
          description: 'Alătură-te echipei noastre și oferă servicii excepționale',
          requirements: [
            'Abilități excelente de comunicare',
            'Experiență în servicii pentru clienți',
            'Jucător de echipă',
          ],
        },
        {
          title: 'Bucătar',
          description: 'Creează preparate uimitoare în bucătăria noastră profesională',
          requirements: [
            'Formare culinară sau experiență',
            'Cunoașterea normelor de siguranță alimentară',
            'Pasiune pentru gătit',
          ],
        },
        {
          title: 'Manager',
          description: 'Conduce echipa noastră și asigură operațiuni fluente',
          requirements: [
            'Experiență în management restaurant',
            'Abilități de leadership',
            'Capacitate de rezolvare a problemelor',
          ],
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  EN: {
    // ── Header ───────────────────────────────────────────────────────────────
    header: {
      reservation: 'Reservation',
      order: 'Order',
      menu: 'Menu',
      career: 'Career',
      login: 'Login',
      logout: 'Logout',
      searchPlaceholder: 'Search dishes...',
    },

    // ── Footer ───────────────────────────────────────────────────────────────
    footer: {
      aboutTitle: 'About Us',
      aboutText:
        'GastroFlow delivers premium dining experiences with carefully curated menus and exceptional service.',
      contactTitle: 'Contact',
      email: 'Email: info@gastroflow.md',
      phone: 'Phone: +373 22 123 456',
      address: 'Address: Chisinau, Moldova',
      quickLinksTitle: 'Quick Links',
      reservation: 'Reservation',
      orderOnline: 'Order Online',
      menu: 'Menu',
      career: 'Career',
      feedback: 'Feedback',
      termsTitle: 'Terms',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      cookiePolicy: 'Cookie Policy',
      copyright: '© 2026 GastroFlow. All rights reserved.',
    },

    // ── Home – HeroCarousel ───────────────────────────────────────────────────
    home: {
      orderNow: 'Order Now',
      slides: [
        { title: 'Premium Steaks', description: 'Finest cuts, perfectly grilled' },
        { title: 'Artisan Pasta', description: 'Handcrafted with Italian tradition' },
        { title: 'Elegant Desserts', description: 'Sweet endings to remember' },
        { title: 'Fresh Seafood', description: 'Ocean to table excellence' },
        { title: 'Gourmet Burgers', description: 'Elevated comfort food' },
      ],
      // MenuSection
      menuTitle: 'Our Menu',
      menuSubtitle: 'Discover our curated selection of premium dishes',
      searchResultsTitle: 'Search Results',
      searchResultsFor: 'Showing results for',
      noResults: 'No results found',
      loadingMenu: 'Loading menu...',
    },

    // ── Menu Page ────────────────────────────────────────────────────────────
    menu: {
      title: 'Our Menu',
      showing: 'Showing',
      of: 'of',
      items: 'items',
      searchPlaceholder: 'Search by dish name or ingredient...',
      categoriesTitle: 'Categories',
      filtersTitle: 'Filters',
      dietary: 'Dietary',
      ingredients: 'Ingredients',
      searchIngredients: 'Search ingredients...',
      priceRange: 'Price Range',
      resetFilters: 'Reset Filters',
      loadingMenu: 'Loading menu...',
      loadError: 'Unable to load menu data. Please try again.',
      retry: 'Retry',
      noMatch: 'No items match your filters',
      ingredientsLabel: 'Ingredients:',
    },

    // ── Order Page ───────────────────────────────────────────────────────────
    order: {
      title: 'Order Management',
      selectType: 'Select Order Type',
      orderSummary: 'Order Summary',
      placeOrder: 'Place Order',
      browseMenu: 'Browse Menu',
      noCartItems: 'No items in cart yet. Visit the Menu to add items.',
      yourOrders: 'Your Orders',
      noOrders: 'No orders found',
      cancel: 'Cancel',
      cancelConfirm: 'Are you sure you want to cancel this order?',
      deliveryAddress: 'Delivery Address',
      deliveryPlaceholder: 'Enter your full delivery address...',
      estimatedTime: 'Estimated time:',
      orderTypes: {
        delivery: { label: 'Delivery', description: 'Get it delivered to your door' },
        takeaway: { label: 'Takeaway', description: 'Pick up from restaurant' },
        dineIn: { label: 'Dine-In', description: 'Eat at the restaurant' },
      },
      statusLabels: {
        draft: 'Created',
        confirmed: 'Order Confirmed',
        'in-preparation': 'In Preparation',
        ready: 'Ready',
        delivered: 'Delivered',
      },
      estimatedTimes: {
        confirmed: '30-40 minutes',
        draft: 'Waiting to be sent to kitchen',
        'in-preparation': '15-20 minutes',
        other: '5 minutes',
      },
      successMsg: '🎉 Your order has been placed successfully!',
      errorCart: 'Your cart is empty. Add items from the Menu before placing an order.',
      errorAddress: 'Please enter a delivery address.',
    },

    // ── Reservation Page ─────────────────────────────────────────────────────
    reservation: {
      title: 'Reserve a Table',
      subtitle: 'Book your dining experience with us',
      date: 'Date',
      time: 'Time',
      selectTime: 'Select time',
      numberOfGuests: 'Number of Guests',
      guest: 'Guest',
      guests: 'Guests',
      fullName: 'Full Name',
      phoneNumber: 'Phone Number',
      specialRequests: 'Special Requests (Optional)',
      specialRequestsPlaceholder:
        'Any dietary restrictions, allergies, or special occasions...',
      confirmReservation: 'Confirm Reservation',
      cancel: 'Cancel',
      successWithTable:
        'Reservation submitted successfully! A table was marked as reserved.',
      successNoTable:
        'Reservation submitted successfully! We will confirm shortly.',
    },

    // ── Cart Page ────────────────────────────────────────────────────────────
    cart: {
      title: 'Shopping Cart',
      emptyTitle: 'Your cart is empty',
      emptySubtitle: 'Add some delicious items to get started!',
      browseMenu: 'Browse Menu',
      subtotalLabel: 'Subtotal:',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      tax: 'Tax (10%)',
      total: 'Total',
      paymentMethod: 'Payment Method',
      card: 'Credit/Debit Card',
      cash: 'Cash on Delivery',
      checkout: 'Proceed to Checkout',
      continueShopping: 'Continue Shopping',
      clearCart: 'Clear Cart',
    },

    // ── Feedback Page ────────────────────────────────────────────────────────
    feedback: {
      title: 'Feedback',
      subtitle: 'Share your thoughts with us',
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      message: 'Message',
      messagePlaceholder: 'Write your feedback here...',
      submit: 'Submit',
      sending: 'Sending...',
      successMessage: 'Thank you for your feedback!',
      errors: {
        name: 'Name is required.',
        email: 'Email is required.',
        message: 'Message is required.',
      },
    },

    // ── Account Page ─────────────────────────────────────────────────────────
    account: {
      title: 'My Account',
      personalInfo: 'Personal Info',
      dashboard: 'Dashboard',
      myOrders: 'My Orders',
      reservations: 'Reservations',
      logout: 'Logout',
      personalInfoTitle: 'Personal Information',
      fullName: 'Full Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      address: 'Address',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      saveChanges: 'Save Changes',
      ordersTitle: 'My Orders History',
      noOrders: 'No orders yet.',
      reservationsTitle: 'My Reservations',
      noReservations: 'No reservations yet.',
      total: 'Total',
      table: 'Table',
      at: 'at',
      guests: 'guests',
      profileUpdated: 'Profile updated successfully!',
    },

    // ── Login Page ───────────────────────────────────────────────────────────
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your account',
      client: 'Client',
      staff: 'Staff',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      noAccount: "Don't have an account?",
      register: 'Register',
      backToHome: 'Back to Home',
      staffEmailPlaceholder:
        'waiter@gastroflow.md / cook@gastroflow.md / manager@gastroflow.md',
      clientEmailPlaceholder: 'your@email.com',
    },

    // ── Career Page ──────────────────────────────────────────────────────────
    career: {
      title: 'Join Our Team',
      subtitle: 'Be part of the GastroFlow family',
      requirements: 'Requirements:',
      applicationFormTitle: 'Application Form',
      positionLabel: 'Position Applied For',
      selectPosition: 'Select a position',
      fullName: 'Full Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      uploadCV: 'Upload CV',
      coverLetter: 'Cover Letter / Message',
      coverLetterPlaceholder: "Tell us why you'd be a great fit for our team...",
      submitApplication: 'Submit Application',
      cancel: 'Cancel',
      successAlert: 'Application submitted successfully! We will contact you soon.',
      positions: [
        {
          title: 'Waiter',
          description: 'Join our front-of-house team and deliver exceptional service',
          requirements: [
            'Excellent communication skills',
            'Customer service experience',
            'Team player',
          ],
        },
        {
          title: 'Cook',
          description: 'Create amazing dishes in our professional kitchen',
          requirements: [
            'Culinary training or experience',
            'Knowledge of food safety',
            'Passion for cooking',
          ],
        },
        {
          title: 'Manager',
          description: 'Lead our team and ensure smooth operations',
          requirements: [
            'Restaurant management experience',
            'Leadership skills',
            'Problem-solving ability',
          ],
        },
      ],
    },
  },
} as const;

export type Language = keyof typeof translations;
export type Translations = typeof translations[Language];
