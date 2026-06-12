package hospital.config;

import java.util.Locale;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

/**
 * Configuration for internationalization (i18n).
 * Supports Vietnamese (vi) and English (en) languages.
 */
@Configuration
public class LocaleConfiguration {

    /**
     * Configure MessageSource for loading message properties files.
     * Messages are loaded from classpath:i18n/messages_*.properties
     */
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:i18n/messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setFallbackToSystemLocale(false);
        messageSource.setDefaultLocale(Locale.forLanguageTag("vi-VN"));
        messageSource.setCacheSeconds(3600); // Cache for 1 hour in production
        return messageSource;
    }

    /**
     * Configure LocaleResolver to determine current locale from Accept-Language header.
     * Falls back to Vietnamese (vi-VN) as default locale.
     */
    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver localeResolver = new AcceptHeaderLocaleResolver();
        localeResolver.setDefaultLocale(Locale.forLanguageTag("vi-VN"));
        localeResolver.setSupportedLocales(
            java.util.Arrays.asList(
                Locale.forLanguageTag("vi-VN"),
                Locale.forLanguageTag("en-US"),
                Locale.ENGLISH
            )
        );
        return localeResolver;
    }
}
