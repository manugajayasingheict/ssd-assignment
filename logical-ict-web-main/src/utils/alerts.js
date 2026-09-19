import Swal from "sweetalert2";

export function showSuccess(message) {
  return Swal.fire({
    icon: "success",
    title: "Success!",
    text: message,
    confirmButtonColor: "#6f42c1"
  });
}

export function showError(error) {
  return Swal.fire({
    icon: "error",
    title: "Oops!",
    text: getFriendlyMessage(error?.code),
    confirmButtonColor: "#6f42c1"
  });
}

function getFriendlyMessage(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Invalid email format.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/weak-password":
      return "Password is too weak.";
    case "permission-denied":
      return "You don't have permission for this action.";
    case "not-found":
      return "Requested data not found.";
    case "unavailable":
      return "Server is busy. Try again soon.";
    default:
      return "Something went wrong. Please try again.";
  }
}
