import React from "react";

interface RetroGradientBackgroundProps {
  children: React.ReactNode;
}

const RetroGradientBackground: React.FC<RetroGradientBackgroundProps> = ({
  children,
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0c]">
        <div
          className="absolute opacity-40 mix-blend-screen"
          style={{
            top: "10%",
            left: "20%",
            width: "60%",
            height: "70%",
            background:
              "linear-gradient(135deg, #1e1e1e 0%, #444444 50%, #2a2a2a 25%)",
            transform: "rotate(-15deg) skew(5deg, 10deg)",
            borderRadius: "30% 70% 20% 40% / 50% 30% 60% 40%",
            filter: "blur(60px)",
            zIndex: 1,
          }}
        ></div>

        <div
          className="absolute opacity-30 mix-blend-screen"
          style={{
            top: "30%",
            left: "30%",
            width: "70%",
            height: "60%",
            background:
              "linear-gradient(315deg, #6a2800 0%, #a03b00 50%, #682600 10%)",
            transform: "rotate(25deg) skew(-10deg, 5deg)",
            borderRadius: "60% 40% 60% 30% / 30% 60% 40% 50%",
            filter: "blur(50px)",
            zIndex: 2,
          }}
        ></div>

        <div
          className="absolute opacity-30 mix-blend-screen"
          style={{
            top: "25%",
            left: "10%",
            width: "65%",
            height: "65%",
            background:
              "linear-gradient(to bottom, #6a0000 0%, #900000 50%, #4a0000 10%)",
            transform: "rotate(-5deg) skew(15deg, -5deg)",
            borderRadius: "40% 60% 40% 60% / 60% 30% 70% 40%",
            filter: "blur(70px)",
            zIndex: 3,
          }}
        ></div>

        <div
          className="absolute opacity-20 mix-blend-screen"
          style={{
            top: "5%",
            left: "65%",
            width: "30%",
            height: "25%",
            background: "linear-gradient(45deg, #2a2a2a 0%, #505050 100%)",
            transform: "rotate(35deg) skew(-15deg, 10deg)",
            borderRadius: "70% 30% 50% 50% / 40% 60% 30% 70%",
            filter: "blur(40px)",
            zIndex: 1,
          }}
        ></div>

        <div
          className="absolute opacity-15 mix-blend-screen"
          style={{
            bottom: "10%",
            right: "5%",
            width: "25%",
            height: "20%",
            background: "linear-gradient(225deg, #333333 0%, #4a4a4a 100%)",
            transform: "rotate(-25deg) skew(10deg, -5deg)",
            borderRadius: "40% 60% 30% 70% / 60% 30% 70% 40%",
            filter: "blur(35px)",
            zIndex: 1,
          }}
        ></div>

        <div
          className="absolute opacity-15 mix-blend-screen"
          style={{
            bottom: "15%",
            left: "5%",
            width: "20%",
            height: "25%",
            background: "linear-gradient(135deg, #7a3000 0%, #8a3800 100%)",
            transform: "rotate(-10deg) skew(-5deg, 15deg)",
            borderRadius: "30% 70% 60% 40% / 50% 50% 40% 60%",
            filter: "blur(30px)",
            zIndex: 2,
          }}
        ></div>

        <div
          className="absolute opacity-20 mix-blend-screen"
          style={{
            top: "10%",
            right: "15%",
            width: "15%",
            height: "20%",
            background: "linear-gradient(45deg, #800000 0%, #600000 100%)",
            transform: "rotate(15deg) skew(5deg, -10deg)",
            borderRadius: "50% 50% 30% 70% / 60% 40% 70% 30%",
            filter: "blur(25px)",
            zIndex: 2,
          }}
        ></div>

        <div
          className="absolute inset-0 mix-blend-overlay pointer-events-none opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='bgNoiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' seed='3' stitchTiles='stitch'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='1.5' intercept='-0.2'/%3E%3CfeFuncG type='linear' slope='1.5' intercept='-0.2'/%3E%3CfeFuncB type='linear' slope='1.5' intercept='-0.2'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23bgNoiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>

        <div
          className="absolute inset-0 mix-blend-overlay pointer-events-none z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' seed='5' stitchTiles='stitch'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='2.5' intercept='-0.7'/%3E%3CfeFuncG type='linear' slope='2.5' intercept='-0.7'/%3E%3CfeFuncB type='linear' slope='2.5' intercept='-0.7'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: 0.15,
          }}
        ></div>
      </div>

      <div className="relative z-20 min-h-screen">{children}</div>
    </div>
  );
};

export default RetroGradientBackground;
