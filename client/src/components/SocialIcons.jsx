import React from 'react'

const SocialIcons = () => {
  return (
     <div className="flex mt-6 justify-center  items-center gap-5 ">
                
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/axl.sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition"
                  aria-label="Instagram"
                >
                  <img
                    className="h-5 w-5"
                    src="/instagram.png"
                    alt="Instagram"
                  />
                </a>

                {/* Email */}
                <a
                  href="mailto:spidey.9449@gmail.com"
                  className="hover:scale-110 transition"
                  aria-label="Email"
                >
                  <img
                    className="h-5 w-5"
                    src="/gmail.png"
                    alt="Email"
                  />
                </a>

              </div>
  )
}

export default SocialIcons