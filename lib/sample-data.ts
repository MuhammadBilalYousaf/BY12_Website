import type { Product } from "./types"


// FAQ Items
export interface FAQItem {
  question: string
  answer: string
}

export const faqItems: FAQItem[] = [
  {
    question: "How do I choose the right perfume?",
    answer:
      "Consider your personal style, the occasion, and season. Floral scents work well for spring/summer, while woody and spicy notes are perfect for fall/winter. We recommend trying samples first to find your signature scent.",
  },
  {
    question: "How long does perfume last?",
    answer:
      "Our perfumes typically last 8-12 hours on skin. Longevity depends on factors like skin type, climate, and application method. Apply to pulse points and moisturized skin for better lasting power.",
  },
  {
    question: "What's your return policy?",
    answer:
      "We offer a 7-days return policy for unopened products. If you're not satisfied with your purchase, you can return it for a full refund or exchange. Opened products can be exchanged within 7 days.",
  },
  {
    question: "Do you offer samples?",
    answer:
      "Yes! We offer sample sizes for most of our fragrances. You can purchase sample sets or request free samples with your order. This is a great way to try before committing to a full-size bottle.",
  },
  {
    question: "How should I store my perfume?",
    answer:
      "Store perfumes in a cool, dry place away from direct sunlight and heat. Keep them in their original boxes when possible. Avoid storing in bathrooms due to humidity and temperature fluctuations.",
  },
  {
    question: "Are your perfumes authentic?",
    answer:
      "Absolutely! All our perfumes are 100% authentic and sourced directly from authorized distributors. We guarantee the quality and authenticity of every product we sell.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Right Now!! We accept only Cash on Delivery (COD).",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is available for an additional fee. Free shipping is offered on orders over Rs.4000. You'll receive tracking information once your order ships.",
  },
]

// Testimonials
export interface Testimonial {
  id: string
  name: string
  role: string
  image: string
  rating: number
  comment: string
  text: string
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Fashion Designer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format",
    rating: 5,
    comment:
      "Absolutely love the Midnight Rose! The scent is sophisticated and long-lasting. I receive compliments every time I wear it. BY12 has become my go-to perfume brand.",
    text:
      "Absolutely love the Midnight Rose! The scent is sophisticated and long-lasting. I receive compliments every time I wear it. BY12 has become my go-to perfume brand.",
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Business Executive",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format",
    rating: 5,
    comment:
      "Ocean Breeze is my signature scent now. It's fresh, professional, and perfect for daily wear. The quality is outstanding and the price is reasonable. Highly recommended!",
    text:
      "Ocean Breeze is my signature scent now. It's fresh, professional, and perfect for daily wear. The quality is outstanding and the price is reasonable. Highly recommended!",
  },
  {
    id: "3",
    name: "Emma Williams",
    role: "Marketing Manager",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format",
    rating: 5,
    comment:
      "I'm impressed with the entire collection! The Cherry Blossom scent is delicate yet memorable. Fast shipping and excellent customer service. Will definitely order again.",
    text:
      "I'm impressed with the entire collection! The Cherry Blossom scent is delicate yet memorable. Fast shipping and excellent customer service. Will definitely order again.",
  },
  {
    id: "4",
    name: "David Martinez",
    role: "Entrepreneur",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format",
    rating: 5,
    comment:
      "Black Leather is bold and masculine - exactly what I was looking for. The packaging is premium and the fragrance quality rivals luxury brands at a fraction of the price.",
    text:
      "Black Leather is bold and masculine - exactly what I was looking for. The packaging is premium and the fragrance quality rivals luxury brands at a fraction of the price.",
  },
  {
    id: "5",
    name: "Lisa Anderson",
    role: "Interior Designer",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format",
    rating: 5,
    comment:
      "Royal Oud is pure luxury! The scent is rich and captivating. I love that BY12 offers authentic, high-quality perfumes with exceptional service. My new favorite brand!",
    text:
      "Royal Oud is pure luxury! The scent is rich and captivating. I love that BY12 offers authentic, high-quality perfumes with exceptional service. My new favorite brand!",
  },
  {
    id: "6",
    name: "James Wilson",
    role: "Software Developer",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format",
    rating: 5,
    comment:
      "Great experience from start to finish. The website is easy to navigate, delivery was quick, and the Amber Nights fragrance exceeded my expectations. Five stars!",
    text:
      "Great experience from start to finish. The website is easy to navigate, delivery was quick, and the Amber Nights fragrance exceeded my expectations. Five stars!",
  },
]
