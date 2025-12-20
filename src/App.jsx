import { createSignal, onMount, Show } from "solid-js";

const EQUIPMENT_TYPES = [
  { id: "vinastar", label: "Vinastar", image: "🏸", maxQty: 2, price: 12 },
  { id: "as10", label: "AS10", image: "🎯", maxQty: 2, price: 18 },
  { id: "autres", label: "Autres...", image: "➕", maxQty: 0, price: 0 },
];

const OTHER_EQUIPMENT = [
  { id: "B2", label: "B2", maxQty: 2, price: 18 },
  { id: "grip", label: "Grip", maxQty: 3, price: 2 },
];

const LOCATIONS = ["Léo Lagrange", "Argoulets"];

const TIME_SLOTS = [
  { id: "mardi", label: "Mardi", day: 2 },
  { id: "mercredi", label: "Mercredi", day: 3 },
  { id: "vendredi_midi", label: "Vendredi midi", day: 5, timeRange: [11, 15] },
  { id: "vendredi_soir", label: "Vendredi soir", day: 5, timeRange: [16, 23] },
  { id: "samedi", label: "Samedi", day: 6 },
  { id: "dimanche", label: "Dimanche", day: 0 },
];

const PAYMENT_METHODS = [
  { id: "liquide", label: "Liquide", icon: "💵" },
  { id: "cheque", label: "Chèque", icon: "📝" },
  { id: "ic", label: "IC/Entraînement", icon: "🎫" },
];

function detectTimeSlot() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  for (const slot of TIME_SLOTS) {
    if (slot.day !== day) continue;
    if (!slot.timeRange) return slot.id;
    if (hour >= slot.timeRange[0] && hour < slot.timeRange[1]) {
      return slot.id;
    }
  }

  return TIME_SLOTS[0].id;
}

function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    lieu: params.get("lieu"),
    equipment: params.get("equipment"),
    scriptUrl: params.get("scriptUrl"),
  };
}

function App() {
  const urlParams = getURLParams();

  const [memberName, setMemberName] = createSignal("");
  const [selectedEquipment, setSelectedEquipment] = createSignal(
    urlParams.equipment || "",
  );
  const [showOthers, setShowOthers] = createSignal(false);
  const [quantity, setQuantity] = createSignal(1);
  const [location, setLocation] = createSignal(urlParams.lieu || LOCATIONS[0]);
  const [timeSlot, setTimeSlot] = createSignal("");
  const [paymentMethod, setPaymentMethod] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);
  const [message, setMessage] = createSignal({ type: "", text: "" });

  onMount(() => {
    setTimeSlot(detectTimeSlot());
  });

  const handleEquipmentSelect = (equipmentId) => {
    if (equipmentId === "autres") {
      setShowOthers(true);
      setSelectedEquipment("");
    } else {
      setSelectedEquipment(equipmentId);
      setShowOthers(false);
      setQuantity(1);
    }
  };

  const handleOtherEquipmentSelect = (equipmentId) => {
    setSelectedEquipment(equipmentId);
    setQuantity(1);
  };

  const getMaxQuantity = () => {
    const allEquipment = [...EQUIPMENT_TYPES, ...OTHER_EQUIPMENT];
    const equipment = allEquipment.find((e) => e.id === selectedEquipment());
    return equipment?.maxQty || 1;
  };

  const incrementQuantity = () => {
    const max = getMaxQuantity();
    if (quantity() < max) {
      setQuantity(quantity() + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity() > 1) {
      setQuantity(quantity() - 1);
    }
  };

  const getEquipmentLabel = () => {
    const allEquipment = [...EQUIPMENT_TYPES, ...OTHER_EQUIPMENT];
    const equipment = allEquipment.find((e) => e.id === selectedEquipment());
    return equipment?.label || "";
  };

  const getTimeSlotLabel = () => {
    const slot = TIME_SLOTS.find((s) => s.id === timeSlot());
    return slot?.label || "";
  };

  const getPaymentLabel = () => {
    const payment = PAYMENT_METHODS.find((p) => p.id === paymentMethod());
    if (payment?.id === "cheque") return "Chèque";
    if (payment?.id === "ic") return "IC/Entraînement";
    return payment?.label || "";
  };

  const getEquipmentPrice = () => {
    const allEquipment = [...EQUIPMENT_TYPES, ...OTHER_EQUIPMENT];
    const equipment = allEquipment.find((e) => e.id === selectedEquipment());
    return equipment?.price || 0;
  };

  const getTotalPrice = () => {
    return getEquipmentPrice() * quantity();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!memberName() || !selectedEquipment() || !paymentMethod()) {
      setMessage({
        type: "error",
        text: "Veuillez remplir tous les champs requis",
      });
      return;
    }

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // Script URL from URL param or env var
      const scriptUrl = urlParams.scriptUrl || import.meta.env.VITE_SCRIPT_URL;

      // Validate scriptUrl is configured and absolute
      if (!scriptUrl) {
        throw new Error(
          "URL du script non configurée. Utilisez le paramètre ?scriptUrl=... ou configurez VITE_SCRIPT_URL",
        );
      }

      if (
        !scriptUrl.startsWith("http://") &&
        !scriptUrl.startsWith("https://")
      ) {
        throw new Error(
          "URL du script invalide. Doit commencer par http:// ou https://",
        );
      }

      // Define the expected spreadsheet headers
      const headers = [
        "Horodateur",
        "Nom de l'adhérent acheteur",
        "Type de volant",
        "Quantité",
        "Lieu",
        "Créneau",
        "Moyen de paiement",
        "Grip",
        "Surgrip?",
        "Colonne 7",
      ];

      // Build data object with keys matching headers
      const equipmentLabel = getEquipmentLabel();
      const isGrip = equipmentLabel.toLowerCase() === "grip";
      const isSurgrip = equipmentLabel.toLowerCase() === "surgrip";

      const data = {
        "Nom de l'adhérent acheteur": memberName(),
        "Type de volant": isGrip || isSurgrip ? "" : equipmentLabel,
        Quantité: isGrip || isSurgrip ? 0 : quantity(),
        Lieu: location(),
        Créneau: getTimeSlotLabel(),
        "Moyen de paiement": getPaymentLabel(),
        Grip: isGrip ? quantity() : 0,
        "Surgrip?": isSurgrip ? quantity() : 0,
      };

      const payload = {
        headers: headers,
        data: data,
      };

      // Remove Content-Type header to avoid CORS preflight request
      // Google Apps Script will still parse the JSON body correctly
      const response = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Read the response from the Google Apps Script
      const result = await response.json();

      if (result.status === "error") {
        let errorMessage = result.message || "Erreur lors de l'enregistrement";

        // Add user-friendly message for header mismatch errors
        if (errorMessage.includes("Header mismatch")) {
          errorMessage =
            "Oups, le formulaire a changé ! Il faut mettre à jour cette app pour ne pas y ajouter des données mal formatées dans le spreadsheet.\n\nDétails techniques : " +
            errorMessage;
        }

        throw new Error(errorMessage);
      }

      setMessage({ type: "success", text: "Achat enregistré avec succès !" });

      // Reset form
      setTimeout(() => {
        setMemberName("");
        setSelectedEquipment(urlParams.equipment || "");
        setShowOthers(false);
        setQuantity(1);
        setTimeSlot(detectTimeSlot());
        setPaymentMethod("");
        setMessage({ type: "", text: "" });
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Erreur lors de l'enregistrement",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    return memberName() && selectedEquipment() && paymentMethod();
  };

  const googleFormUrl = import.meta.env.VITE_GOOGLE_FORM_URL;
  const githubRepoUrl = import.meta.env.VITE_GITHUB_REPO_URL;

  return (
    <>
      <Show when={googleFormUrl}>
        <div class="fallback-banner">
          <a href={googleFormUrl} target="_blank" rel="noopener noreferrer">
            En cas de problème avec cette application, utilisez le formulaire
            Google original
          </a>
        </div>
      </Show>

      <main>
        <h1>Achat Équipement</h1>

        <form onSubmit={handleSubmit}>
          <section class="form-section">
            <h2>Nom de l'adhérent</h2>
            <input
              type="text"
              value={memberName()}
              onInput={(e) => setMemberName(e.target.value)}
              placeholder="nom de l’adhérent"
            />
          </section>

          <section class="form-section">
            <h2>Équipement</h2>
            <Show when={!showOthers()}>
              <div class="equipment-grid">
                {EQUIPMENT_TYPES.map((equipment) => (
                  <button
                    type="button"
                    class={`equipment-card ${selectedEquipment() === equipment.id ? "selected" : ""}`}
                    onClick={() => handleEquipmentSelect(equipment.id)}
                  >
                    <div style="font-size: 2rem;">{equipment.image}</div>
                    <div>{equipment.label}</div>
                    <Show when={equipment.price > 0}>
                      <div style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">
                        {equipment.price}€
                      </div>
                    </Show>
                  </button>
                ))}
              </div>
            </Show>

            <Show when={showOthers()}>
              <div class="choice-buttons">
                {OTHER_EQUIPMENT.map((equipment) => (
                  <button
                    type="button"
                    class={`choice-button ${selectedEquipment() === equipment.id ? "selected" : ""}`}
                    onClick={() => handleOtherEquipmentSelect(equipment.id)}
                  >
                    <div>{equipment.label}</div>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">
                      {equipment.price}€
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                style="margin-top: 0.75rem; padding: 0.5rem; width: 100%; border: 2px solid #ddd; background: white; border-radius: 6px; cursor: pointer;"
                onClick={() => {
                  setShowOthers(false);
                  setSelectedEquipment("");
                }}
              >
                ← Retour
              </button>
            </Show>

            <Show
              when={selectedEquipment() && selectedEquipment() !== "autres"}
            >
              <div class="counter">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={quantity() <= 1}
                >
                  −
                </button>
                <span>{quantity()}</span>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={quantity() >= getMaxQuantity()}
                >
                  +
                </button>
              </div>
            </Show>
          </section>

          <section class="form-section">
            <h2>Lieu</h2>
            <div class="choice-buttons">
              {LOCATIONS.map((loc) => (
                <button
                  type="button"
                  class={`choice-button ${location() === loc ? "selected" : ""}`}
                  onClick={() => setLocation(loc)}
                >
                  {loc}
                </button>
              ))}
            </div>
          </section>

          <section class="form-section">
            <h2>Créneau</h2>
            <div class="time-slots">
              {TIME_SLOTS.map((slot) => (
                <button
                  type="button"
                  class={`time-slot ${timeSlot() === slot.id ? "selected" : ""}`}
                  onClick={() => setTimeSlot(slot.id)}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </section>

          <section class="form-section">
            <h2>Moyen de paiement</h2>
            <div class="payment-methods">
              {PAYMENT_METHODS.map((method) => (
                <button
                  type="button"
                  class={`payment-button ${paymentMethod() === method.id ? "selected" : ""}`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div style="font-size: 2rem;">{method.icon}</div>
                  <div class="label">{method.label}</div>
                </button>
              ))}
            </div>
          </section>

          <Show when={selectedEquipment() && selectedEquipment() !== "autres"}>
            <section class="form-section total-price">
              <h2>Total</h2>
              <div style="font-size: 1.75rem; font-weight: bold; text-align: center; color: #27ae60;">
                {getTotalPrice()}€
              </div>
              <Show when={quantity() > 1}>
                <div style="font-size: 0.9rem; text-align: center; color: #666; margin-top: 0.25rem;">
                  {quantity()} × {getEquipmentPrice()}€
                </div>
              </Show>
            </section>
          </Show>

          <Show when={message().text}>
            <div class={message().type === "error" ? "error" : "success"}>
              {message().text}
            </div>
          </Show>

          <button
            type="submit"
            class="submit-button"
            disabled={!isFormValid() || submitting()}
          >
            {submitting() ? "Envoi..." : "Enregistrer l'achat"}
          </button>
        </form>

        <Show when={githubRepoUrl}>
          <div class="github-footer">
            <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span>Code source sur GitHub</span>
            </a>
          </div>
        </Show>
      </main>
    </>
  );
}

export default App;
