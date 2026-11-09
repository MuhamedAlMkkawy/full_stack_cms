import * as yup from "yup";
import { useI18n } from "vue-i18n";

export const useForgotPasswordSchema = () => {
  const { t } = useI18n();

  return yup.object({
    email: yup
      .string()
      .required(t("login_page.validations.email.required"))
      .email(t("login_page.validations.email.invalid")),
    password: yup
      .string()
      .required(t("login_page.validations.password.required"))
      .min(6, t("login_page.validations.password.min")),
    confirmPassword: yup
      .string()
      .required(t("auth_pages.validations.confirmPassword.required"))
      .oneOf(
        [yup.ref("password")],
        t("auth_pages.validations.confirmPassword.match")
      ),
  });
};
