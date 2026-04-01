import { Link } from "react-router-dom";
import vector3 from "../assets/vectore3.png";
import background2 from "../assets/background2.jpeg";

export default function Home() {
  return (
    <div className="space-y-10" id="top">
      <section className="relative overflow-hidden bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-8 md:p-12 lg:p-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 min-h-[400px]">
          <div className="flex-[1.2] max-w-2xl relative z-10 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
              Learn Science by <span className="text-blue-600">Doing</span>
            </h1>

            <p className="mt-6 text-slate-700 text-base md:text-lg font-semibold leading-relaxed">
              Build DIY science kits, follow fun tutorials, and improve with quizzes & feedback.
              MiniMinds helps kids learn through real experiments.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-sky-600 text-white font-extrabold shadow-lg hover:shadow-xl hover:bg-sky-700 transition-all transform hover:-translate-y-1"
              >
                Start as a Kid 🚀
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl bg-sky-600 text-white font-extrabold shadow-lg hover:shadow-xl hover:bg-sky-700 transition-all transform hover:-translate-y-1"
              >
                Login 🔐
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Feature title="Safe Learning" emoji="🧤" text="Simple guidance." />
              <Feature title="Fun Kits" emoji="📦" text="Hands-on kits." />
              <Feature title="Track Progress" emoji="📈" text="See your results." />
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end relative z-0">
            <img
              src={vector3}
              alt="Science Vector"
              className="w-full max-w-[450px] xl:max-w-[550px] h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <MiniCard
          title="For Kids"
          emoji="🧒"
          text="Register, learn science, and see your progress dashboard."
        />
        <MiniCard
          title="For Admin"
          emoji="👑"
          text="Manage kids accounts, content, orders, and quizzes."
        />
        <MiniCard
          title="For Everyone"
          emoji="🌟"
          text="Better learning outcomes with practical education."
        />
      </section>

      <section
        id="about"
        className="scroll-mt-20 bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12"
      >
        <div className="flex-1 space-y-5">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
            Empowering the Next Generation of Scientists 🚀
          </h2>
          <p className="text-slate-600 text-lg font-semibold leading-relaxed">
            We believe that the best way to learn science is by getting your hands dirty. We provide fun,
            interactive DIY science kits and comprehensive tutorials designed to spark curiosity and foster a
            deep love for learning. Whether you are building a volcano or understanding electricity, we are
            here to support every step of your science adventure. Let’s make learning unforgettable!
          </p>
        </div>

        <div className="flex-1 w-full h-64 md:h-[450px] rounded-3xl overflow-hidden relative shadow-md border m-4 flex items-center justify-center">
          <img
            src={background2}
            alt="MiniMinds About"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          />
        </div>
      </section>

      <footer className="bg-slate-800/95 text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <div className="px-8 md:px-12 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <h3 className="text-2xl font-black text-white">MiniMinds 🔬</h3>
              <p className="mt-4 text-slate-300 leading-relaxed font-medium">
                Inspiring young minds through fun science experiments, interactive kits,
                and guided learning experiences that make education practical and exciting.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-extrabold text-white">Quick Links</h4>
              <ul className="mt-4 space-y-3 text-slate-300 font-medium">
                <li>
                  <Link to="/" className="hover:text-sky-400 transition">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="#about" className="hover:text-sky-400 transition">
                    About Us
                  </a>
                </li>
                <li>
                  <Link to="/register" className="hover:text-sky-400 transition">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-sky-400 transition">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-extrabold text-white">Useful Links</h4>
              <ul className="mt-4 space-y-3 text-slate-300 font-medium">
                <li>
                  <Link to="/register" className="hover:text-sky-400 transition">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-sky-400 transition">
                    Student Portal
                  </Link>
                </li>
                <li>
                  <a href="#about" className="hover:text-sky-400 transition">
                    Our Mission
                  </a>
                </li>
                <li>
                  <a href="#top" className="hover:text-sky-400 transition">
                    Back to Top
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-extrabold text-white">Contact</h4>
              <ul className="mt-4 space-y-3 text-slate-300 font-medium">
                <li>
                  <span className="font-bold text-white">Email:</span>{" "}
                  info@miniminds.com
                </li>
                <li>
                  <span className="font-bold text-white">Phone:</span>{" "}
                  +94 77 123 4567
                </li>
                <li>
                  <span className="font-bold text-white">Address:</span>{" "}
                  Colombo, Sri Lanka
                </li>
                {/* <li>
                  <span className="font-bold text-white">Hours:</span>{" "}
                  Mon - Fri, 8.00 AM - 5.00 PM
                </li> */}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-8 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} MiniMinds. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#" className="hover:text-sky-400 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-sky-400 transition">
              Terms & Conditions
            </a>
            <a href="#" className="hover:text-sky-400 transition">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, emoji, text }) {
  return (
    <div className="bg-white/60 border border-white/50 rounded-2xl p-4 shadow-sm">
      <div className="text-2xl">{emoji}</div>
      <div className="text-slate-900 font-extrabold">{title}</div>
      <div className="text-slate-700 text-sm font-semibold">{text}</div>
    </div>
  );
}

function MiniCard({ title, emoji, text }) {
  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-6">
      <div className="text-3xl">{emoji}</div>
      <div className="mt-2 text-xl font-black text-slate-900">{title}</div>
      <div className="mt-1 text-slate-600 font-semibold">{text}</div>
    </div>
  );
}