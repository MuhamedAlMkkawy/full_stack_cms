import * as yup from "yup";
import { useI18n } from "vue-i18n";

export const useRegisterSchema = () => {
  const { t } = useI18n();

  return yup.object({
    name: yup.string().required(t("auth_pages.validations.name.required")),
    email: yup
      .string()
      .required(t("login_page.validations.email.required"))
      .email(t("login_page.validations.email.invalid")),
    companyName: yup
      .string()
      .required(t("auth_pages.validations.companyName.required")),
    companySlug: yup
      .string()
      .matches(
        /^[a-zA-Z0-9-]*$/,
        t("auth_pages.validations.companySlug.invalid")
      )
      .nullable(),
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
