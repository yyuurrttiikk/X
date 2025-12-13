(() => {
    console.clear();
    console.log("%cФИНАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ — ДЕКАБРЬ 2025", "color: #ff0066; font-size: 22px; font-weight: bold");
    console.log("✓ НЕ ОТКРЫВАЕТ ПРОФИЛИ НИКОГДА (клик по span + MouseEvent)\n✓ Рандом 3–9 сек\n✓ Пауза 5 минут после 50\n✓ Пропускает проблемные, не останавливается");

    let unfollowed = 0;
    const PAUSE_AFTER = 50;
    const BIG_PAUSE = 5 * 60 * 1000; // 5 минут

    const randomDelay = () => Math.floor(Math.random() * (9000 - 3000 + 1)) + 3000;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // Поиск кнопки подтверждения
    const getConfirmButton = () => {
        let btn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
        if (btn) return btn;

        btn = document.querySelector('div[role="dialog"] div[role="button"]:last-of-type');
        if (btn && /Unfollow|Отписаться/.test(btn.textContent.trim())) return btn;

        return [...document.querySelectorAll('div[role="button"], button')]
            .find(el => /Unfollow|Отписаться/.test(el.textContent.trim()));
    };

    // САМЫЙ НАДЁЖНЫЙ КЛИК 2025: по span внутри кнопки через MouseEvent
    const clickFollowingSafely = (container) => {
        // Ищем span с текстом "Following" или "Вы подписаны"
        let target = [...container.querySelectorAll('span')].find(s => 
            /Following|Вы подписаны/.test(s.textContent.trim())
        );

        // Fallback: если не нашёл span, берём элемент с data-testid
        if (!target) {
            target = container.querySelector('[data-testid$="-unfollow"]') || container;
        }

        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        target.dispatchEvent(event);
    };

    // Поиск контейнеров кнопок Following (видимые)
    const getFollowingContainers = () => {
        const containers = [];
        // Основной поиск по data-testid
        document.querySelectorAll('[data-testid$="-unfollow"]').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.height > 0 && rect.top > -400) {
                containers.push(el.closest('div[data-testid="userCell"]') || el);
            }
        });

        // Fallback по тексту (на случай изменений)
        if (containers.length === 0) {
            document.querySelectorAll('div[role="button"]').forEach(el => {
                if (/Following|Вы подписаны/.test(el.textContent)) {
                    containers.push(el);
                }
            });
        }

        return containers.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    };

    let queue = getFollowingContainers();
    let index = 0;

    const run = async () => {
        while (true) {
            if (unfollowed > 0 && unfollowed % PAUSE_AFTER === 0) {
                console.log(`\nОтписано ${unfollowed} → пауза 5 минут`);
                await sleep(BIG_PAUSE);
                console.log("Продолжаем!\n");
                queue = getFollowingContainers();
                index = 0;
            }

            if (index >= queue.length) {
                console.log("Конец списка → скроллим вниз");
                window.scrollBy(0, window.innerHeight * 4);
                await sleep(8000);

                const newQueue = getFollowingContainers();
                if (newQueue.length === 0) {
                    console.log("Больше нет кнопок — всё отписано или обнови страницу.");
                    break;
                }
                queue = newQueue;
                index = 0;
                console.log(`Подгружено новых (${queue.length})`);
            }

            const container = queue[index++];
            container.scrollIntoView({ behavior: "smooth", block: "center" });
            await sleep(1200);

            console.log(`Отписка #${unfollowed + 1}`);
            clickFollowingSafely(container);

            let confirmed = false;
            for (let i = 0; i < 40; i++) { // ждём до 16 сек
                await sleep(400);
                const confirm = getConfirmButton();
                if (confirm) {
                    confirm.click();
                    unfollowed++;
                    console.log(`Успех! Всего: ${unfollowed}`);
                    confirmed = true;
                    break;
                }
            }

            if (!confirmed) {
                console.log("Модалка не появилась → пропускаем (возможно лимит)");
                document.querySelector('[data-testid="confirmationSheetCancel"]')?.click();
                await sleep(4000); // доп. пауза при пропуске
            }

            const delay = randomDelay();
            console.log(`Задержка: ${Math.round(delay / 1000)} сек`);
            await sleep(delay);
        }

        console.log("%cГОТОВО! Отписано: " + unfollowed, "color: lime; font-size: 20px; font-weight: bold");
    };

    run();
})();
