import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, ShieldCheck, Cpu, Users, MapPin, CheckCircle2 } from 'lucide-react';

const RulesSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const ruleCategories = [
    {
      title: "1. Eligibility & Team Formation",
      icon: <Users size={20} className="text-[#00F3FF]" />,
      rules: [
        "Open to currently enrolled undergraduate or postgraduate engineering students.",
        "Valid student ID or official proof of enrollment is mandatory.",
        "Individual entries or teams of 2 to 4 members are permitted. Interdisciplinary and multi-year teams are allowed.",
        "Each team must designate a team leader. No team changes are allowed after the event starts.",
        "Organizers, sponsors, family members, or students registered in multiple teams are non-eligible."
      ]
    },
    {
      title: "2. Registration & Identification",
      icon: <ShieldCheck size={20} className="text-[#A855F7]" />,
      rules: [
        "Participants must carry both their college ID and a hard copy of a government-verified ID (e.g., Aadhaar, Driving License, Passport).",
        "A signed hardcopy consent form from a parent or guardian is strictly mandatory for all participants.",
        "Onsite Confirmation: Upon arrival on October 10th, confirm attendance at the registration desk. Onsite registration is mandatory for entry."
      ]
    },
    {
      title: "3. Equipment & Amenities",
      icon: <Cpu size={20} className="text-[#FBBF24]" />,
      rules: [
        "Participants must bring their own laptops, chargers and extension board.",
        "The venue will provide continuous access to power outlets and stable Wi-Fi/Ethernet connectivity.",
        "Lunch, snacks, and dinner will be provided on October 10th. Breakfast will be provided on October 11th."
      ]
    },
    {
      title: "4. Project Development Guidelines",
      icon: <CheckCircle2 size={20} className="text-[#00F3FF]" />,
      rules: [
        "Originality: All projects must be original and built entirely during the 24-hour hackathon period.",
        "Alignment: Projects must strictly align with the provided themes or approved problem statements. Off-topic submissions will be disqualified.",
        "Code & Libraries: Open-source libraries, APIs, and frameworks are allowed if properly credited. Unauthorized proprietary material is strictly prohibited.",
        "Submission Deadline: All projects must be submitted before the official deadline; late submissions will not be evaluated."
      ]
    },
    {
      title: "5. Participation Rules & Conduct",
      icon: <AlertTriangle size={20} className="text-[#FBBF24]" />,
      rules: [
        "Respectful communication with jury members, organizers, volunteers, and peers is mandatory. Misconduct results in immediate disqualification.",
        "On-Site Presence: All team members must remain physically present at the venue throughout the event. Remote participation is not permitted.",
        "The organizing committee's decisions regarding team selection, evaluations, and winner declarations are final and binding."
      ]
    },
    {
      title: "6. Campus Conduct, Safety & Security",
      icon: <MapPin size={20} className="text-[#A855F7]" />,
      rules: [
        "Only registered participants and authorized personnel are permitted inside the campus.",
        "Perfumes, lighters, sharp objects, and outside food or snacks are strictly prohibited inside the venue.",
        "Mandatory security checks, including bag checks, will be conducted at the campus entrance.",
        "If any team member needs to exit the campus due to an emergency, prior approval and intimation to coordinators is required.",
        "A minimum of two team members must remain at the venue at all times."
      ]
    },
    {
      title: "7. Emergency Protocol & Exit Policy ",
      icon: <MapPin size={20} className="text-[#A855F7]" />,
      rules: [
        "Leaving Venue: If any team member needs to exit the campus due to an emergency, prior approval and intimation to coordinators is required.",
        "Minimum Team Presence: A minimum of two team members must remain at the venue at all times.",
      ]
    }
  ];

  return (
    <section id="rules" className="py-24 px-4 relative z-10 scroll-mt-20 overflow-hidden min-h-[80vh]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold uppercase mb-4">
            Rules & <span className="text-white">Regulations</span>
          </h2>
          <p className="text-gray-400 font-mono text-sm max-w-2xl mx-auto uppercase tracking-widest">
            Please read the comprehensive rulebook carefully. Failure to comply may result in disqualification.
          </p>
        </div>
        
        <div className="grid gap-4">
          {ruleCategories.map((category, idx) => (
            <div key={idx} className="glass-panel border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-black/40 rounded-lg">
                    {category.icon}
                  </div>
                  <h3 className="font-orbitron font-bold text-lg md:text-xl tracking-wide">
                    {category.title}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === idx ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="text-gray-400" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2">
                      <div className="h-px w-full bg-white/5 mb-6" />
                      <ul className="space-y-4">
                        {category.rules.map((rule, ruleIdx) => (
                          <li key={ruleIdx} className="flex gap-4 items-start group">
                            <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-[#00F3FF]/50 group-hover:bg-[#00F3FF] transition-colors" />
                            <p className="text-gray-300 font-mono text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">
                              {rule}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RulesSection;
