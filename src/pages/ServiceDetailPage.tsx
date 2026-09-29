import { useParams, useNavigate } from 'react-router-dom';
import { SERVICES } from '@/constants/services';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, ArrowLeft, Palette } from 'lucide-react';

export function ServiceDetailPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const service = SERVICES.find(s => s.id === serviceId);

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Service not found</h2>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-lifted h-96 lg:h-[500px]">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            </div>

            {service.designs && service.designs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Design Gallery</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {service.designs.map((design, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden aspect-square shadow-soft hover:shadow-glass transition-shadow">
                      <img
                        src={design}
                        alt={`Design ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <div className="glass-card p-8 rounded-2xl flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">{service.name}</h1>
              
              <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-lg">{service.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-primary font-bold text-2xl">
                  <DollarSign className="w-6 h-6" />
                  <span>{service.price}</span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-3">About This Service</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-3">What's Included</h3>
                <ul className="space-y-2">
                  {service.category === 'basic' && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Nail shaping and filing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Cuticle care and treatment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Hand massage or foot soak</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Polish application</span>
                      </li>
                    </>
                  )}
                  {service.category === 'premium' && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Premium gel polish application</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">UV curing for long-lasting results</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Extended hand or foot massage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Lasts up to 3 weeks</span>
                      </li>
                    </>
                  )}
                  {service.category === 'art' && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Custom design consultation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Hand-painted artwork or 3D elements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Premium embellishments and crystals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Base manicure included</span>
                      </li>
                    </>
                  )}
                  {service.category === 'bridal' && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Pre-wedding trial session</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Manicure and pedicure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Custom bridal nail art</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                        <span className="text-muted-foreground">Premium products and luxury experience</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lifted transition-all text-lg py-6"
                onClick={() => navigate(`/book?service=${service.id}`)}
              >
                Book This Service
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
