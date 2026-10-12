import React, {useEffect, useState} from "react";
import {api_key, render_url} from "../data/keys";
import {resolveClientCoordinates, resolveClientIpv4} from "../utils/clientIpv4";
import AddModal from "./AddModal";

export const replyDraftKey = letterId => `ltc-reply-draft:${letterId}`;

export default function ReplyComposer({letter, onClose, onPreview, isHidden = false}) {
  const letterId = String(letter?._id?.$oid || letter?._id || "");
  const [newLetter, setNewLetter] = useState({from: "", to: letter?.from || "Anonymous", message: "", link: "", email: ""});
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(replyDraftKey(letterId)) || "{}");
      setNewLetter({
        from: typeof draft.alias === "string" ? draft.alias : "",
        to: letter?.from || "Anonymous",
        message: typeof draft.message === "string" ? draft.message : "",
        link: typeof draft.link === "string" ? draft.link : "",
        email: typeof draft.email === "string" ? draft.email : "",
        ...(typeof draft.to === "string" && draft.to ? {to: draft.to} : {}),
      });
    } catch {
      localStorage.removeItem(replyDraftKey(letterId));
    }
  }, [letterId, letter?.from]);

  useEffect(() => {
    if (!letterId) return;
    try { localStorage.setItem(replyDraftKey(letterId), JSON.stringify({message: newLetter.message, alias: newLetter.from, to: newLetter.to, link: newLetter.link, email: newLetter.email || ""})); } catch { /* storage unavailable */ }
  }, [letterId, newLetter.email, newLetter.from, newLetter.link, newLetter.message, newLetter.to]);

  const closeAndSave = () => {
    try { localStorage.setItem(replyDraftKey(letterId), JSON.stringify({message: newLetter.message, alias: newLetter.from, to: newLetter.to, link: newLetter.link, email: newLetter.email || ""})); } catch { /* storage unavailable */ }
    onClose();
  };

  const readPhoto = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read the attached photo."));
    reader.readAsDataURL(file);
  });

  const submit = async (letterData, onProgress = () => {}) => {
    setError("");
    try {
      const ipv4Promise = resolveClientIpv4();
      const coordsPromise = resolveClientCoordinates();
      let photo;
      if (letterData.photoFile) {
        onProgress({percent: 20, label: "Uploading photo…"});
        const uploadResponse = await fetch(`${render_url}/photo-upload`, {
          method: "POST",
          headers: {"Content-Type": "application/json", "x-api-key": api_key},
          body: JSON.stringify({file: await readPhoto(letterData.photoFile)}),
        });
        const uploadData = await uploadResponse.json().catch(() => ({}));
        if (!uploadResponse.ok || !uploadData.photo) throw new Error(uploadData.error || "Unable to upload the photo.");
        photo = uploadData.photo;
      }
      const [clientIpv4, clientCoords] = await Promise.all([
        ipv4Promise,
        coordsPromise,
      ]);
      const normalizedEmail = typeof letterData.email === "string" ? letterData.email.trim().toLowerCase() : "";
      onProgress({percent: 60, label: "Opening payment…"});
      const response = await fetch(new URL("/api/create-reply-payment", render_url).href, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": api_key,
          ...(clientIpv4 ? {"x-client-ipv4": clientIpv4} : {}),
        },
        body: JSON.stringify({
          letterId,
          message: letterData.message.trim(),
          alias: letterData.from.trim() || undefined,
          to: letterData.to.trim(),
          photo,
          ...(normalizedEmail
            ? {
                email: normalizedEmail,
                notificationEmail: normalizedEmail,
                notificationPreferences: letterData.notificationPreferences || {
                  replies: true,
                  reactionMilestones: [10, 50, 100],
                },
              }
            : {}),
          ...(clientIpv4 ? {ip: clientIpv4} : {}),
          ...(clientCoords ? {coords: clientCoords} : {}),
          amount: 200,
          payment_method_types: ["qrph"],
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to start payment. Please try again.");
      if (!data.checkoutUrl || new URL(data.checkoutUrl).protocol !== "https:") throw new Error("Invalid checkout link. Please try again.");
      onProgress({percent: 100, label: "Redirecting…"});
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      setError(err.message || "Unable to start payment. Please try again.");
      return false;
    }
    return false;
  };

  return (
    <div
      className={isHidden ? "reply-composer-hidden" : undefined}
      style={isHidden ? {display: "none"} : undefined}
    >
      <AddModal
        showAddModal
        toggleAddModal={closeAndSave}
        newLetter={newLetter}
        setNewLetter={setNewLetter}
        handleAddLetter={submit}
        submitError={error}
        variant="reply"
        parentLetter={letter}
        onPreview={onPreview}
      />
    </div>
  );
}
