Here is the specification for a small project I want to work on, with some context first.

I’m a member of a badminton association, helping with equipment sold by the association to its members. We want to track which equipment is sold, to who, and how it’s payed, to make sure our treasury stay consistent, and there is no abuse by members. The tracking should happen in a google sheet. The default option to add entries to that sheet is a google form. In fact we will make a google form, and simply default to the sheet containing the form responses as our tracking google sheet.

The entries of the form are the following (in French):
- "Nom de l’adhérent acheteur": text form
- "Type de volant": choice between: "Babolat 2" | "Babolat 4" | "Vinastar" | "AS10"
- "Quantité": 1 or 2
- "Grip": 0 or 1 or 2 or 3
- "Surgrip": 0 or 1 or 2 or 3
- "Lieu": choice between "Léo Lagrange" | "Argoulets"
- "Créneau": choice between: "Mardi" | "Mercredi" | "Vendredi midi" | "Vendredi soir" | "Samedi" | "Dimanche"
- "Moyen de paiement": choice between: "Liquide" | "Chèque" | "IC/Entraînement"

Now, in addition to this form, I want to also provide a simple static web page, that makes filling the form much faster. For example, using a QR code to load the static web app, we can prefill "Lieu" thanks to the physical location embedded in the QR code, and "Créneau" thanks to the time at which the page is loaded. We can also make a couple QR codes dedicated for the most common request which is buying shuttlecocks. We can also store in local storage names of the member buying such that frequent buyer are faster to enter.

The web app will use google apps script to interact with the form sheet to add entries to it. The web app must be minimalist and mobile friendly since it will almost exclusively be used from a mobile. Here are some additional requirements for the mobile app.
- Use Solid.js for the static web app.
- For the buying member, use a simple text field. Do not use local storage or anything else yet to help with this field, just a simple text field.
- For the equipment, use images to make it easy to pick "Vinastar" and "AS10", then another one like "Autres ..." where we can then pick the other options, "Babolat 2", "Babolat 4", "Grip" or "Surgrip".
- Then for the quantity, make it an easy counter, that defaults to 1, and can be easily incremented up to 2 for the shuttlecocks or up to 3 for the "Grip" and "Surgrip".
- For the "Lieu", there should be a choice between the two options, but most of the time, this choice will be pre-filled thanks to url parameters.
- For the slot "Créneau", try to choose automatically thanks to the local time, but make it still easy to change.
- Finally for the "Moyen de paiement", make it easy to pick one of the 3 options, for example with icons.

In general, try to make the web app as light as possible. No dependency which is not strictly necessary, etc. If you a framework for styling, use something minimalist, which as much as possible uses simple css and try to not modify the html structure, which should stay as minimal and semantically correct as possible.

If you have any question on things not specified clearly, please ask.