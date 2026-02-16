
import React, { useState, useEffect, useRef } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import LogoLoop from './LogoLoop';

interface CountUpProps {
    from: number;
    to: number;
    duration: number;
    className?: string;
    startTrigger: boolean;
}

const CountUp: React.FC<CountUpProps> = ({ from, to, duration, className, startTrigger }) => {
    const [count, setCount] = useState(from);

    useEffect(() => {
        if (!startTrigger) return;

        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
            setCount(Math.floor(progress * (to - from) + from));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [from, to, duration, startTrigger]);

    return <span className={className}>{count}</span>;
};

const AboutUs: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Updated partner logos with specific URLs provided
    const partnerLogos = [
        {
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Pfizer_%282021%29.svg/512px-Pfizer_%282021%29.svg.png",
            alt: "Pfizer",
            title: ""
        },
        {
            src: "https://eduxchange.eu/static/img/logos/logo_tum_normal.png",
            alt: "Technical University of Munich",
            title: ""
        },
        {
            src: "https://dmed-technologies.com/wp-content/uploads/2024/03/Logo-D-1.png",
            alt: "D.med Technologies",
            title: ""
        },
        {
            src: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Bosnalijek_logo.png",
            alt: "Bosnalijek",
            title: ""
        },
        {
            src: "https://cdn.healthtechalpha.com/static/startup_data_images/104615.png",
            alt: "Wellster",
            title: ""
        },
        {
            src: "https://www.kcus.ba/wp-content/uploads/2021/10/Logo-KCUS_featured.jpg",
            alt: "KCUS",
            title: ""
        },
        {
            src: "https://images.seeklogo.com/logo-png/8/1/lek-logo-png_seeklogo-83237.png",
            alt: "Lek",
            title: ""
        }
    ];

    return (
        <section
            ref={sectionRef}
            id="about"
            className="relative py-40 bg-white overflow-hidden border-t border-zinc-100"
        >
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">

                    {/* Left Column: Text Content */}
                    <div className={`space-y-10 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                                <Globe className="w-3.5 h-3.5" /> Naša Priča
                            </div>
                            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-black leading-tight">
                                AiMED: Stvoreno iz prakse, <br />
                                <span className="text-zinc-300">pokrenuto inovacijom.</span>
                            </h2>
                            <div className="space-y-4">
                                <p className="text-zinc-500 text-xl font-normal leading-relaxed max-w-xl">
                                    Tim AiMED-a predstavlja jedinstvenu sinergiju medicinske ekspertize i tehnološke inovativnosti. Naš jezgro čine doktori i medicinski konsultanti sa više od 15 godina aktivnog iskustva u medicini, medicinskom konzaltingu i distribuciji.
                                </p>
                                <p className="text-zinc-500 text-xl font-normal leading-relaxed max-w-xl">
                                    Uz podršku našeg tima programera i marketara iz Njemačke, posvećeni smo implementaciji najmodernijih modela pametne medicine u Bosni i Hercegovini. Zajedno gradimo efikasniju, precizniju i dostupniju budućnost zdravstva.
                                </p>
                            </div>
                        </div>

                        <a
                            href="https://cee-med.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex bg-black text-white px-8 py-4 rounded-2xl text-[15px] font-bold hover:bg-zinc-800 transition-all items-center gap-2 group shadow-xl shadow-zinc-200/50"
                        >
                            Saznajte više o timu
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>

                    {/* Right Column: Counter - Set to 5 seconds duration */}
                    <div className={`flex flex-col items-center lg:items-end transition-all duration-1000 delay-300 ease-out transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                        <div className="flex flex-col items-center lg:items-end">
                            <div className="flex items-baseline text-black">
                                <CountUp
                                    from={0}
                                    to={15}
                                    duration={7}
                                    startTrigger={isVisible}
                                    className="text-8xl md:text-[10rem] font-black tracking-tighter leading-none"
                                />
                                <span className="text-6xl md:text-8xl font-black tracking-tighter">+</span>
                            </div>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-[0.4em] mt-4 lg:text-right">Godina iskustva u medicini</p>
                        </div>
                    </div>
                </div>

                {/* Partner Logo Loop */}
                <div className={`space-y-12 transition-all duration-1000 delay-500 ease-out transform ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="text-center">
                        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-12">Referentne liste i partneri</h3>
                        <div className="py-8 bg-white">
                            <LogoLoop
                                logos={partnerLogos}
                                speed={40}
                                gap={150}
                                fadeOut
                                fadeOutColor="#ffffff"
                                scaleOnHover
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
