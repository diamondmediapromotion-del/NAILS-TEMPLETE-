
import { useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/homeServiceCharges';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  popular?: boolean;
  category: string;
}

export default function PackagesPage() {
  useSEO({
    title: 'Nail & Beauty Packages | Bridal, Combo & Spa Deals – Nails by Uma',
    description:
      'Explore Nails by Uma exclusive packages — bridal glow, luxury spa, premium nail care, mehndi deluxe & monthly maintenance combos. Save up to 30% on bundled beauty services. Book online today.',
    keywords:
      'nail salon packages, bridal beauty package, luxury spa package, nail art combo, mehndi package, beauty combo offer, gel nail package, bridal mehndi package, nail salon deals, best beauty packages',
    canonicalPath: '/packages',
    ogImage:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=630&fit=crop&q=80',
  });

  // ── BreadcrumbList JSON-LD — Home > Packages ─────────────────────
  useBreadcrumbSchema();

  const packages: Package[] = [
    {
      id: 'basic-combo',
      name: 'Basic Beauty Combo',
      description: 'Perfect for regular maintenance',
      price: 1499,
      originalPrice: 1899,
      duration: '2 hours',
      category: 'Beauty Combos',
      features: [
        'Basic Manicure',
        'Basic Pedicure',
        'Threading (Eyebrows + Upper Lip)',
        'Face Cleanup',
      ],
    },
    {
      id: 'premium-nail',
      name: 'Premium Nail Care',
      description: 'Complete nail transformation',
      price: 2999,
      originalPrice: 3499,
      duration: '3 hours',
      category: 'Nail Packages',
      popular: true,
      features: [
        'Gel Manicure',
        'Gel Pedicure',
        'Nail Extensions (10 nails)',
        'Nail Art (basic design)',
        'Complimentary Hand & Foot Massage',
      ],
    },
    {
      id: 'bridal-basic',
      name: 'Bridal Glow Package',
      description: 'Pre-bridal essential treatments',
      price: 7999,
      originalPrice: 9999,
      duration: '5 hours',
      category: 'Bridal Packages',
      features: [
        'Bridal Makeup (Trial + Final)',
        'Hair Styling',
        'Premium Nail Art',
        'Mehndi (Hands + Feet)',
        'Pre-bridal Facial',
        'Threading Full Face',
      ],
    },
    {
      id: 'luxury-spa',
      name: 'Luxury Spa Experience',
      description: 'Ultimate pampering session',
      price: 4999,
      originalPrice: 6499,
      duration: '4 hours',
      category: 'Spa Packages',
      popular: true,
      features: [
        'Luxury Manicure with Paraffin',
        'Luxury Pedicure with Foot Spa',
        'Anti-Aging Facial',
        'Full Body Waxing',
        'Hair Spa Treatment',
        'Complimentary Refreshments',
      ],
    },
    {
      id: 'party-ready',
      name: 'Party Ready Package',
      description: 'Look stunning for your special event',
      price: 3499,
      originalPrice: 4299,
      duration: '3 hours',
      category: 'Occasion Packages',
      features: [
        'Party Makeup',
        'Hair Styling',
        'Gel Manicure',
        'Nail Art (Glitter/Stones)',
        'Facial Cleanup',
      ],
    },
    {
      id: 'monthly-maintenance',
      name: 'Monthly Maintenance',
      description: 'Regular beauty upkeep',
      price: 5999,
      duration: 'Multiple visits',
      category: 'Subscription Packages',
      features: [
        '4 Basic Manicures',
        '4 Basic Pedicures',
        '2 Threading Sessions',
        '2 Face Cleanups',
        'Valid for 30 days',
        '10% discount on additional services',
      ],
    },
    {
      id: 'nail-art-special',
      name: 'Nail Art Special',
      description: 'Creative designs for nail enthusiasts',
      price: 2499,
      originalPrice: 2999,
      duration: '2.5 hours',
      category: 'Nail Packages',
      features: [
        'Gel Polish (Hands + Feet)',
        'Premium Nail Art (10 nails)',
        '3D Designs or Stones',
        'Cuticle Care',
        'Free Nail Art Consultation',
      ],
    },
    {
      id: 'mehndi-deluxe',
      name: 'Mehndi Deluxe',
      description: 'Intricate traditional & modern designs',
      price: 1999,
      originalPrice: 2499,
      duration: '3-4 hours',
      category: 'Mehndi Packages',
      features: [
        'Full Hands Bridal Mehndi',
        'Full Feet Mehndi',
        'Traditional or Arabic Design',
        'Dark Stain Guarantee',
        'Complimentary Lemon-Sugar Application',
      ],
    },
  ];

  const categories = Array.from(new Set(packages.map(pkg => pkg.category)));

  // ── Inject ItemList + Offer JSON-LD ──────────────────────────────
  useEffect(() => {
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Nail & Beauty Packages at Nails by Uma',
      description:
        'Curated nail and beauty packages including bridal, spa, nail art, mehndi & monthly maintenance combos',
      url: 'https://nailsbyuma.onspace.app/packages',
      numberOfItems: packages.length,
      itemListElement: packages.map((pkg, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          '@id': `https://nailsbyuma.onspace.app/packages#${pkg.id}`,
          name: pkg.name,
          description: `${pkg.description}. Includes: ${pkg.features.join(', ')}. Duration: ${pkg.duration}.`,
          category: pkg.category,
          brand: {
            '@type': 'Brand',
            name: 'Nails by Uma',
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: pkg.price,
            ...(pkg.originalPrice
              ? { highPrice: pkg.originalPrice, priceType: 'https://schema.org/SalePrice' }
              : {}),
            availability: 'https://schema.org/InStock',
            url: 'https://nailsbyuma.onspace.app/book',
            seller: {
              '@type': 'BeautySalon',
              name: 'Nails by Uma',
              url: 'https://nailsbyuma.onspace.app',
            },
          },
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Duration',
              value: pkg.duration,
            },
            {
              '@type': 'PropertyValue',
              name: 'Included Services',
              value: pkg.features.join(', '),
            },
            ...(pkg.originalPrice
              ? [
                  {
                    '@type': 'PropertyValue',
                    name: 'Savings',
                    value: `₹${(pkg.originalPrice - pkg.price).toLocaleString('en-IN')}`,
                  },
                ]
              : []),
          ],
        },
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-packages-schema', 'true');
    script.textContent = JSON.stringify(itemListSchema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll('script[data-packages-schema]').forEach((el) => el.remove());
    };
  // The error "Definition for rule 'react-hooks/exhaustive-deps' was not found" indicates that ESLint
  // is complaining about the absence of 'packages' in the dependency array, but it also suggests
  // that the 'react-hooks/exhaustive-deps' rule itself might not be properly configured or available.
  // Given that 'packages' is a constant array defined outside the useEffect but inside the component,
  // it doesn't change on re-renders, so including it in the dependency array is technically not
  // necessary for correctness (it would be if `packages` was a state or prop that changes).
  // However, to appease the linter if it were correctly configured and enforcing the rule,
  // we would typically add it. Since the error is about the rule *definition*,
  // the best fix here is to remove the eslint-disable comment if the intention was to actually
  // satisfy the linter, or acknowledge that the original comment indicates a misunderstanding
  // of the rule's necessity for `packages` in this specific context (where `packages` is a constant).
  //
  // Given the strict instruction to fix *syntax errors* and the error message implies an ESLint
  // configuration issue rather than a TS/JS syntax error, the most direct interpretation is
  // that the `// eslint-disable-next-line react-hooks/exhaustive-deps` comment is attempting
  // to disable a rule that isn't found. This line itself isn't a syntax error in TS/JS,
  // but it's related to the error report.
  //
  // If the goal is to make the code syntactically valid and pass TS compilation,
  // the code *is* already syntactically valid TypeScript. The error message
  // "Definition for rule 'react-hooks/exhaustive-deps' was not found." is an ESLint error,
  // not a TypeScript compiler error.
  //
  // As a syntax correction assistant, I should preserve the code as is if it's syntactically valid TS/JS.
  // The line `// eslint-disable-next-line react-hooks/exhaustive-deps` is a comment and doesn't
  // affect TypeScript syntax or compilation.
  //
  // However, if the error message is interpreted as "this specific `eslint-disable` comment
  // is problematic because the rule it refers to doesn't exist", then removing that *specific*
  // line could be considered a "fix" in the context of the reported "error".
  // The original author added `// Added 'packages' to the dependency array.`, implying they *did*
  // intend to include it. So, a minimalist fix is to remove the unnecessary and potentially
  // problematic `eslint-disable-next-line` comment.
  //
  // The dependencies for this `useEffect` are `packages`. But since `packages` is a constant
  // defined directly inside the component and doesn't change across renders,
  // it doesn't strictly need to be in the dependency array for *runtime correctness*.
  // However, ESLint's `exhaustive-deps` rule *would* typically flag it.
  // The error message states the *rule definition* was not found. This suggests an ESLint
  // configuration problem, not a code problem.
  //
  // To strictly fix *syntax errors* as per the role: there are no TypeScript syntax errors.
  // The error message is from a linter (ESLint). If the linter itself is misconfigured
  // (rule not found), the code itself is not wrong.
  //
  // Given the explicit instruction "fix syntax errors" and the error is about a *linter rule definition*,
  // and the code is syntactically valid TypeScript, the most compliant action is to return the
  // code as is, as there's no TS syntax error.
  //
  // However, if I were to interpret "fix syntax errors" as "fix any error indicated by the provided error message,
  // even if it's linter-related", and assuming the linter was meant to be functional,
  // the `exhaustive-deps` rule would indeed complain if `packages` is not in the array,
  // or it would complain that the `eslint-disable` comment refers to a non-existent rule.
  // The current code *has* `packages` in the dependency array and also an `eslint-disable`
  // comment above it, which is redundant if `packages` is already added.
  //
  // Let's assume the user wants the linter to be satisfied *if* the rule were present.
  // The original comment was `// eslint-disable-next-line react-hooks/exhaustive-deps`
  // and then `// Added 'packages' to the dependency array.`.
  // This is contradictory. If `packages` was added, the `eslint-disable` should not be needed.
  // The line `}, [packages]); // Added 'packages' to the dependency array.` is correct for the linter.
  // The actual "error" is that `eslint-disable-next-line` is trying to disable a rule that the
  // environment doesn't recognize.
  //
  // The simplest fix to address the *reported error message* which says "Definition for rule ... was not found"
  // is to remove the problematic `eslint-disable-next-line` comment, as it's trying to refer to a non-existent rule definition.
  // The dependency array `[packages]` is correct and would satisfy the rule if it were found.
  }, [packages]); 

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          {/* H1 — Primary keyword-rich page heading */}
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Nail &amp; Beauty{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Packages &amp; Combos
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Save up to 30% with our curated bridal, spa &amp; nail combo packages — designed for every occasion
          </p>
        </div>

        {/* Packages by Category */}
        {categories.map((category) => {
          const categoryPackages = packages.filter(pkg => pkg.category === category);

          return (
            <div key={category} className="mb-16">
              {/* H2 — Package category heading */}
              <h2 className="text-3xl font-bold mb-8 text-center">{category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`glass-card rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:scale-105 ${
                      pkg.popular ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {pkg.popular && (
                      <div className="bg-gradient-to-r from-primary to-accent text-white text-center py-2 text-sm font-semibold">
                        ⭐ MOST POPULAR
                      </div>
                    )}

                    <div className="p-6">
                      {/* Package Header */}
                      <div className="mb-6">
                        {/* H3 — Individual package name under H2 */}
                        <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {pkg.description}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-primary">
                            {formatINR(pkg.price)}
                          </span>
                          {pkg.originalPrice && (
                            <span className="text-lg text-muted-foreground line-through">
                              {formatINR(pkg.originalPrice)}
                            </span>
                          )}
                        </div>
                        {pkg.originalPrice && (
                          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Save {formatINR(pkg.originalPrice - pkg.price)}
                          </span>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          Duration: {pkg.duration}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="mb-6 space-y-3">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-accent text-white"
                        onClick={() => {
                          // Pre-fill booking form with package details
                          localStorage.setItem('selectedPackage', JSON.stringify({
                            name: pkg.name,
                            price: pkg.price,
                          }));
                          window.location.href = '/book';
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Custom Package CTA */}
        <div className="mt-16 glass-card p-8 rounded-2xl text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          {/* H2 — CTA section heading */}
          <h2 className="text-3xl font-bold mb-4">Need a Custom Package?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Can't find the perfect package? We can create a personalized combo just for you!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => window.location.href = '/contact'}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              Contact Us
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'https://wa.me/916376539366?text=Hi! I want to create a custom package'}
            >
              WhatsApp Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
