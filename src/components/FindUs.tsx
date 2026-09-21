import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { Section } from './Section';
import { Spark } from './Spark';

interface LocationInfo {
  id: string;
  name: string;
  mall: string;
  address: string;
  hours: string;
  mapQuery: string;
  embedUrl: string;
  directionsUrl: string;
}

const LOCATIONS: LocationInfo[] = [
  {
    id: 'kingpin',
    name: 'Kingpin Food Court',
    mall: 'Kingpin Chittagong',
    address: 'Kingpin Food Court, GEC Circle, Chattogram, Bangladesh',
    hours: 'Open Daily: 12:00 PM – 11:30 PM',
    mapQuery: 'Kingpin+Food+Court+Chittagong',
    embedUrl:
      'https://maps.google.com/maps?q=Kingpin+Food+Court+Chittagong&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Kingpin+Food+Court+Chittagong',
  },
  {
    id: 'concord',
    name: 'Concord Mueen Square',
    mall: 'Shopping Mall Food Court',
    address: 'Food Court, Concord Mueen Square, Chawkbazar, Chattogram, Bangladesh',
    hours: 'Open Daily: 12:00 PM – 11:30 PM',
    mapQuery: 'Concord+Mueen+Square+Chittagong',
    embedUrl:
      'https://maps.google.com/maps?q=Concord+Mueen+Square+food+court+Chittagong&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Concord+Mueen+Square+food+court+Chittagong',
  },
];

export function FindUs() {
  return (
    <Section bg="var(--bg)" order={5} className="find-us-section">
      <div id="find-us" className="find-us-container max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* Section Header */}
        <div className="text-center relative max-w-2xl mx-auto mb-12 md:mb-16">
          <motion.div
            initial={{ scale: 0, rotate: -8 }}
            whileInView={{ scale: 1, rotate: -2 }}
            viewport={{ once: true }}
            className="inline-block mb-3"
          >
            <span className="font-['Lilita_One'] text-xl md:text-2xl text-[var(--red)] uppercase tracking-wider bg-[rgba(228,27,35,0.08)] border-2 border-[var(--red)] px-5 py-1.5 rounded-full inline-flex items-center gap-2 shadow-sm">
              <MapPin size={20} className="text-[var(--red)]" />
              VISIT US
            </span>
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-['Anton'] text-5xl sm:text-6xl md:text-7xl text-[var(--red)] uppercase tracking-tight m-0 leading-none"
          >
            FIND US
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="font-['Outfit'] font-medium text-base md:text-lg text-[var(--ink)] mt-4 opacity-80"
          >
            Craving fresh, flame-licked chicken shawarma? Stop by either of our two Chittagong food
            court outlets and taste the madness.
          </motion.p>
        </div>

        {/* Responsive Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {LOCATIONS.map((loc, idx) => (
            <motion.article
              key={loc.id}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + idx * 0.12 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border-3 border-white shadow-[0_12px_32px_rgba(155,27,32,0.08)] flex flex-col justify-between hover:shadow-[0_16px_40px_rgba(155,27,32,0.14)] transition-all duration-300"
            >
              <div>
                {/* Location Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs font-['Bebas_Neue'] tracking-widest text-[var(--red)] uppercase bg-[rgba(228,27,35,0.09)] px-2.5 py-0.5 rounded-md">
                      {loc.mall}
                    </span>
                    <h3 className="font-['Anton'] text-2xl sm:text-3xl text-[var(--red)] tracking-wide mt-1 mb-0">
                      {loc.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[var(--yellow)]/30 text-[var(--maroon)] flex items-center justify-center shrink-0">
                    <MapPin size={22} className="text-[var(--maroon)]" />
                  </div>
                </div>

                {/* Info Pills */}
                <div className="space-y-2 mb-4 font-['Outfit'] font-medium text-sm text-[var(--ink)]">
                  <p className="m-0 flex items-start gap-2 opacity-85">
                    <span className="shrink-0 text-[var(--red)] font-bold">&bull;</span>
                    {loc.address}
                  </p>
                  <p className="m-0 flex items-center gap-2 opacity-75 text-xs text-[var(--maroon)]">
                    <Clock size={14} className="text-[var(--maroon)]" />
                    {loc.hours}
                  </p>
                </div>

                {/* Responsive Embedded Google Map */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white/90 shadow-inner bg-[#ece7dd]">
                  <iframe
                    title={loc.name}
                    src={loc.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-[rgba(155,27,32,0.08)] flex justify-end">
                <a
                  href={loc.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-['Bebas_Neue'] text-lg tracking-wider text-white bg-[var(--red)] hover:bg-[var(--maroon)] px-5 py-2 rounded-full shadow-md transition-colors duration-200"
                >
                  <Navigation size={17} />
                  GET DIRECTIONS
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </Section>
  );
}
