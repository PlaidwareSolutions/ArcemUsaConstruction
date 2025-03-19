import React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const ContactOptions: React.FC = () => {
  return (
    <div className="contact-options p-3 rounded-md bg-gray-100 my-2">
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Phone className="w-4 h-4 text-[#1E90DB] mt-1" />
          <div>
            <div className="font-semibold">Phone</div>
            <div className="text-sm text-gray-600">(713) 624-0083</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Mail className="w-4 h-4 text-[#1E90DB] mt-1" />
          <div>
            <div className="font-semibold">Email</div>
            <div className="text-sm text-gray-600">aj@arcemusa.com</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-[#1E90DB] mt-1" />
          <div>
            <div className="font-semibold">Address</div>
            <div className="text-sm text-gray-600">
              215 Birch Hill Dr
              <br />
              Sugar Land, TX 77479
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-[#1E90DB] mt-1" />
          <div>
            <div className="font-semibold">Business Hours</div>
            <div className="text-sm text-gray-600">
              Monday - Friday: 8:00 AM - 5:00 PM
              <br />
              Saturday: 9:00 AM - 2:00 PM
              <br />
              Sunday: Closed
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-300">
        <div className="text-sm">
          You can also fill out our contact form on the Contact page for
          detailed inquiries or quote requests.
        </div>
      </div>
    </div>
  );
};

export default ContactOptions;
