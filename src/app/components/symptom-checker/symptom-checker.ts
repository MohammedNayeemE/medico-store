import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

interface SuggestedMedicine {
  medicine_id: number;
  name: string;
  price: number;
  priceStr: string;
  img: string;
  description: string;
  dosage?: string;
  type: string;
}

interface ChatMessage {
  type: 'user' | 'bot';
  text?: string;
  medicines?: SuggestedMedicine[];
  timestamp: Date;
}

@Component({
  selector: 'app-symptom-checker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './symptom-checker.html',
  styleUrls: ['./symptom-checker.css']
})
export class SymptomCheckerComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  
  // Using signals for reactive state management
  userInput = signal('');
  messages = signal<ChatMessage[]>([]);
  isTyping = signal(false);
  cartItems = signal<Set<string>>(new Set());
  private shouldScrollToBottom = false;

  // Demo medicines database
  private demoMedicines: { [key: string]: SuggestedMedicine[] } = {
    headache: [
      {
        medicine_id: 1,
        name: 'Aspirin 500mg',
        price: 45,
        priceStr: '₹45',
        img: 'assets/images/aspirin.webp',
        description: 'Effective pain relief and fever reducer',
        dosage: '500mg',
        type: 'Tablet'
      },
      {
        medicine_id: 2,
        name: 'Paracetamol (Crocin) 500mg',
        price: 55,
        priceStr: '₹55',
        img: 'assets/images/paracetamol.webp',
        description: 'Fast-acting pain and fever relief',
        dosage: '500mg',
        type: 'Tablet'
      },
      {
        medicine_id: 3,
        name: 'Ibuprofen 400mg',
        price: 65,
        priceStr: '₹65',
        img: 'assets/images/ibuprofen.webp',
        description: 'Anti-inflammatory pain reliever',
        dosage: '400mg',
        type: 'Tablet'
      }
    ],
    cold: [
      {
        medicine_id: 4,
        name: 'Strepsils Lemon',
        price: 35,
        priceStr: '₹35',
        img: 'assets/images/strepsils.webp',
        description: 'Sore throat and cold relief',
        type: 'Lozenge'
      },
      {
        medicine_id: 5,
        name: 'Cough Syrup (Benadryl)',
        price: 85,
        priceStr: '₹85',
        img: 'assets/images/cough-syrup.webp',
        description: 'Multi-symptom cold and cough relief',
        dosage: '100ml',
        type: 'Syrup'
      },
      {
        medicine_id: 6,
        name: 'Vitamin C 500mg',
        price: 95,
        priceStr: '₹95',
        img: 'assets/images/vitamin-c.webp',
        description: 'Immune system booster',
        dosage: '500mg',
        type: 'Tablet'
      }
    ],
    fever: [
      {
        medicine_id: 7,
        name: 'Thermocol Fever Strip',
        price: 25,
        priceStr: '₹25',
        img: 'assets/images/fever-strip.webp',
        description: 'Instant fever relief band',
        type: 'Strip'
      },
      {
        medicine_id: 3,
        name: 'Paracetamol (Dolo) 650mg',
        price: 65,
        priceStr: '₹65',
        img: 'assets/images/dolo.webp',
        description: 'Fast-acting fever reducer',
        dosage: '650mg',
        type: 'Tablet'
      },
      {
        medicine_id: 8,
        name: 'Electrolyte Drink Mix',
        price: 75,
        priceStr: '₹75',
        img: 'assets/images/electrolyte.webp',
        description: 'Rehydration during fever',
        type: 'Powder'
      }
    ],
    stomach: [
      {
        medicine_id: 9,
        name: 'Antacid Gel (Digene)',
        price: 55,
        priceStr: '₹55',
        img: 'assets/images/digene.webp',
        description: 'Relief from acidity and gas',
        type: 'Gel'
      },
      {
        medicine_id: 10,
        name: 'Omeprazole 20mg',
        price: 95,
        priceStr: '₹95',
        img: 'assets/images/omeprazole.webp',
        description: 'Acid reflux and heartburn relief',
        dosage: '20mg',
        type: 'Tablet'
      },
      {
        medicine_id: 11,
        name: 'Probiotics (Align)',
        price: 250,
        priceStr: '₹250',
        img: 'assets/images/probiotics.webp',
        description: 'Digestive health support',
        type: 'Capsule'
      }
    ],
    default: [
      {
        medicine_id: 1,
        name: 'Multivitamin Tablets',
        price: 180,
        priceStr: '₹180',
        img: 'assets/images/multivitamin.webp',
        description: 'Complete daily vitamin supplement',
        type: 'Tablet'
      },
      {
        medicine_id: 2,
        name: 'Vitamin D3 1000IU',
        price: 120,
        priceStr: '₹120',
        img: 'assets/images/vitamin-d.webp',
        description: 'Bone and immunity support',
        dosage: '1000IU',
        type: 'Tablet'
      }
    ]
  };

  constructor(
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
    // Welcome message
    this.messages.set([{
      type: 'bot',
      text: '👋 Hello! I\'m your health assistant. Tell me how you\'re feeling, and I\'ll suggest suitable medicines for you.',
      timestamp: new Date()
    }]);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  loadCartItems(): void {
    const cart = this.cartService.cart();
    this.cartItems.set(new Set(cart.map((item: any) => item.name)));
  }

  sendMessage(): void {
    if (!this.userInput().trim()) {
      return;
    }

    // Add user message
    this.messages.update(msgs => [...msgs, {
      type: 'user',
      text: this.userInput(),
      timestamp: new Date()
    }]);

    const userQuery = this.userInput();
    this.userInput.set('');
    this.shouldScrollToBottom = true;

    // Show typing indicator
    this.isTyping.set(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      const queryLower = userQuery.toLowerCase();
      
      // Try to match the query with demo data
      let medicines: SuggestedMedicine[] = [];
      let responseText = '';
      
      if (queryLower.includes('head')) {
        medicines = this.demoMedicines['headache'];
        responseText = 'I understand you have a headache. Here are some medicines that can help:';
      } else if (queryLower.includes('cold') || queryLower.includes('cough')) {
        medicines = this.demoMedicines['cold'];
        responseText = 'For cold and cough symptoms, I recommend these medicines:';
      } else if (queryLower.includes('fever')) {
        medicines = this.demoMedicines['fever'];
        responseText = 'To help with your fever, here are my suggestions:';
      } else if (queryLower.includes('stomach') || queryLower.includes('gas') || queryLower.includes('acidity')) {
        medicines = this.demoMedicines['stomach'];
        responseText = 'For stomach-related issues, these medicines should help:';
      } else {
        medicines = this.demoMedicines['default'];
        responseText = 'Here are some general health supplements that might help:';
      }

      // Add bot response with medicines
      this.messages.update(msgs => [...msgs, {
        type: 'bot',
        text: responseText,
        medicines: medicines,
        timestamp: new Date()
      }]);

      console.log(this.messages())

      this.isTyping.set(false);
      this.shouldScrollToBottom = true;
    //   this.loadCartItems(); // Refresh cart items
    }, 1000);
  }

  addToCart(medicine: SuggestedMedicine): void {
    this.cartService.addToCart({
      medicine_id: medicine.medicine_id,
      name: medicine.name,
      price: medicine.price,
      priceStr: medicine.priceStr,
      img: medicine.img
    });
    
    this.cartItems.update(items => {
      const newItems = new Set(items);
      newItems.add(medicine.name);
      return newItems;
    });
    // Toast notification is now handled by CartService
  }

  isInCart(medicineName: string): boolean {
    return this.cartItems().has(medicineName);
  }

  clearChat(): void {
    this.userInput.set('');
    this.messages.set([{
      type: 'bot',
      text: '👋 Hello! I\'m your health assistant. Tell me how you\'re feeling, and I\'ll suggest suitable medicines for you.',
      timestamp: new Date()
    }]);
  }
}
