import { createSignal, onMount, Show } from "solid-js";

const EQUIPMENT_TYPES = [
  { id: "vinastar", label: "Vinastar", image: "🏸", maxQty: 2, price: 12 },
  { id: "as10", label: "AS10", image: "🎯", maxQty: 2, price: 18 },
  { id: "autres", label: "Autres...", image: "➕", maxQty: 0, price: 0 },
];

const OTHER_EQUIPMENT = [
  { id: "babolat2", label: "Babolat 2", maxQty: 2, price: 18 },
  { id: "babolat4", label: "Babolat 4", maxQty: 2, price: 12 },
  { id: "grip", label: "Grip", maxQty: 3, price: 3 },
  { id: "surgrip", label: "Surgrip", maxQty: 3, price: 2 },
];

const LOCATIONS = ["Léo Lagrange", "Argoulets"];

const TIME_SLOTS = [
  { id: "mardi", label: "Mardi", day: 2 },
  { id: "mercredi", label: "Mercredi", day: 3 },
  { id: "vendredi_midi", label: "Vendredi midi", day: 5, timeRange: [11, 14] },
  { id: "vendredi_soir", label: "Vendredi soir", day: 5, timeRange: [18, 23] },
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
      // Script URL from URL param, env var, or hardcoded fallback
      const scriptUrl = urlParams.scriptUrl || import.meta.env.VITE_SCRIPT_URL;

      const data = {
        memberName: memberName(),
        equipmentType: getEquipmentLabel(),
        quantity: quantity(),
        location: location(),
        timeSlot: getTimeSlotLabel(),
        paymentMethod: getPaymentLabel(),
      };

      const response = await fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

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
      setMessage({ type: "error", text: "Erreur lors de l'enregistrement" });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    return memberName() && selectedEquipment() && paymentMethod();
  };

  return (
    <main>
      <h1>Achat Équipement</h1>

      <Show when={message().text}>
        <div class={message().type === "error" ? "error" : "success"}>
          {message().text}
        </div>
      </Show>

      <form onSubmit={handleSubmit}>
        <section class="form-section">
          <h2>Nom de l'adhérent</h2>
          <input
            type="text"
            value={memberName()}
            onInput={(e) => setMemberName(e.target.value)}
            placeholder="Entrez votre nom"
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

          <Show when={selectedEquipment() && selectedEquipment() !== "autres"}>
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

        <button
          type="submit"
          class="submit-button"
          disabled={!isFormValid() || submitting()}
        >
          {submitting() ? "Envoi..." : "Enregistrer l'achat"}
        </button>
      </form>
    </main>
  );
}

export default App;
