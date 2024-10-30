import React from "react";
import "../Css/About.css";

function AboutUs() {
  return (
    <main>
      <section className='about-section'>
        <div className='container'>
          <h1>About Us</h1>
        </div>
      </section>

      <section className='info-section'>
        <div className='container'>
          <div className='row'>
            <div className='image-col'>
              <img
                src='IMG_E5149.jpg' // Update to correct path
                alt='Roseneath Caravan Park'
                className='about-image'
              />
            </div>
            <div className='text-col'>
              <p>
                Grant and Karin Heeley are the owner operators of Roseneath
                Caravan Park. We are here to welcome you and help you enjoy your
                stay and make the best of the beautiful bushlands and lake
                experience.
              </p>
              <p>
                The Roseneath Caravan Park is located in the beautiful, scenic
                Gippsland area, on the sandy, South East shore of Lake
                Wellington. This family and pet friendly caravan park offers a
                areal bush experience, being located in the tranquil bushlands
                of Meerileu.
              </p>
              <p>
                Experience fabulous fishing, boating and swimming. Fishing is a
                lot of fun and good catches os Bream, Mullet, Flathead and Carp
                can be had. Fishing on the lake is great from the shore or a
                boat. Hollands Landing boat ramp is only a short drive from the
                park.
              </p>
              <p>
                You can relax with 2km of sandy, child friendly swimming beach
                on beautiful Lake Wellington. Enjoy the lake'sclean,safe
                swimming conditions and is ideal for yachting, canoeing,
                kayaking, jet skiing and boating.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='activities-section'>
        <div className='container'>
          <p>
            You can relax by the pool or on the lake's sandy beach or take a
            long, lazy stroll along one our many walking tracks or along the
            water's edge. You can also bring your pushbikes and enjoy one of the
            many bike tracks.The park is pet friendly and ponies and horses have
            a large paddock with clean water if you wish to bring them along and
            saddle up for some excellent trail riding.
          </p>
          <p>
            Get back to nature with some native flora and fauna sspotting.
            Abundant wildlife includes rar Sea Eagles, Wedge Tail Eagles,
            friendly Parrots and Rossella's. Wombats, Kangaroos, Wallabies,
            Rabbits and Akidna's are easily found and large bush possums are
            everywhere and are easily hand fed and friendly. Groups of Hog Deer
            are seen occassionally as they are fairly timid.{" "}
          </p>
          <p>
            We are located between Bairnsdale and Sale. The Park is set on 174
            acres of peaceful bushland, including Banksia, Red Gum, White Gum
            and ancident River Gum forest. The Park offers both powered and
            unpowered sites, a communal lounge, separate accommodation, modern
            toilet facilities, sheltered BBQs as well as a camp kitchen. The
            park also offers a swimming pool and tennis court.
          </p>
          <p>
            Let the caravan and camping sexpeience rejuvenate and relax you and
            your family.
          </p>
          <div className='image-col'>
            <img
              src='DSC0E2965.webp' // Update to correct path
              alt='Roseneath Caravan Park'
              className='about-image'
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutUs;
