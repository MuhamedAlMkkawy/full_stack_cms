import * as yup from "yup";
import { useI18n } from "vue-i18n";

export const useLoginSchema = () => {
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
  });
};
