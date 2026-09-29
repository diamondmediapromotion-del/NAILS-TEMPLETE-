import { Award, Heart, Sparkles, Users, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import { useJsonLd } from '@/hooks/useJsonLd';
import { buildAboutPageSchema } from '@/lib/aboutSchema';

const PAGE_TITLE = 'About Nails by Uma | Meet Uma, Founder & Master Nail Artist';
const PAGE_DESCRIPTION =
  'Meet Uma, founder and master nail artist at Nails by Uma. Since 2014 our certified nail, mehndi and beauty specialists have served 5000+ happy clients across Rajasthan with 25+ awards.';

export default function AboutPage() {
  useSEO({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    keywords:
      'Nails by Uma, about Nails by Uma, Uma nail artist, founder Nails by Uma, master nail artist Rajasthan, luxury nail salon team, certified nail technician, professional mehndi artist, best nail salon Rajasthan, LuxeNails by Uma',
    canonicalPath: '/about',
  });

  // ── BreadcrumbList JSON-LD — Home > About Us ─────────────────────
  useBreadcrumbSchema();

  const stats = [
    { icon: Users, label: 'Happy Customers', value: '5000+' },
    { icon: Star, label: 'Years Experience', value: '10+' },
    { icon: Award, label: 'Awards Won', value: '25+' },
    { icon: Sparkles, label: 'Services Offered', value: '50+' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction and comfort are our top priorities. We listen to your needs and deliver exceptional results.',
    },
    {
      icon: Sparkles,
      title: 'Quality Excellence',
      description: 'We use only premium products and latest techniques to ensure the best results for your nails and beauty.',
    },
    {
      icon: Clock,
      title: 'Timely Service',
      description: 'We respect your time. Our efficient team ensures you get premium service within the scheduled time.',
    },
    {
      icon: Award,
      title: 'Expert Team',
      description: 'Our certified professionals have years of experience and undergo regular training in latest trends.',
    },
  ];

  const team = [
    {
      name: 'Uma',
      role: 'Founder & Master Nail Artist',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
      bio: 'Founder of Nails by Uma, with 15+ years of experience in nail art and beauty services',
    },
    {
      name: 'Anita Verma',
      role: 'Senior Nail Technician',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
      bio: 'Specialist in gel extensions and intricate nail designs',
    },
    {
      name: 'Neha Patel',
      role: 'Mehndi Artist',
      image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop',
      bio: 'Traditional and modern mehndi designs expert',
    },
    {
      name: 'Kavita Singh',
      role: 'Beauty Specialist',
      image: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=400&h=400&fit=crop',
      bio: 'Certified beautician with expertise in facials and makeup',
    },
  ];

  // ── LocalBusiness + Person (founder & team) JSON-LD ──────────────
  // Built from the team list and stats rendered below, so the structured
  // data always matches what a visitor (and Googlebot) can actually see.
  useJsonLd(
    buildAboutPageSchema({
      team,
      stats: stats.map(({ label, value }) => ({ label, value })),
      pageTitle: PAGE_TITLE,
      pageDescription: PAGE_DESCRIPTION,
    }),
    'about-page',
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  LuxeNails
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Your trusted destination for premium nail care, beauty services, and artistic transformations. 
                We've been serving our community with dedication and passion for over a decade.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => window.location.href = '/book'}
                  className="bg-gradient-to-r from-primary to-accent text-white"
                >
                  Book Appointment
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.location.href = '/gallery'}
                >
                  View Gallery
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=700&fit=crop"
                alt="Nail salon"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl font-bold mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Story</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto"></div>
          </div>
          <div className="glass-card p-8 rounded-2xl">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Founded in 2014 by Uma, our master nail artist, LuxeNails began with a simple vision: to 
              provide world-class nail care and beauty services in a comfortable, hygienic environment. 
              What started as a small salon has grown into a trusted name in the community.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Over the years, we've served thousands of satisfied customers, won multiple awards for 
              excellence, and built a team of passionate professionals who treat every customer like family.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Today, we continue to innovate, bringing the latest trends in nail art, beauty treatments, 
              and customer care to our valued clients. Our commitment to quality and customer satisfaction 
              remains unwavering.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">What makes us different</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="glass-card p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground">Expert professionals dedicated to your beauty</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="glass-card rounded-xl overflow-hidden group hover:shadow-xl transition-all">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Experience LuxeNails?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Book your appointment today and let our expert team pamper you
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => window.location.href = '/book'}
              className="bg-gradient-to-r from-primary to-accent text-white px-8"
            >
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'tel:+916376539366'}
            >
              Call Us: +91 6376539366
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
