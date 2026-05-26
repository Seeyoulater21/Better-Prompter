#!/bin/bash
set -u

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="5173"
APP_URL="http://localhost:$PORT"
LOG_DIR="$APP_DIR/.launcher-logs"
LOG_FILE="$LOG_DIR/app.log"
PID=""
MODE="stopped"
START_TIME=""
SELECTED=0

NC='\033[0m'
FG_BLOCK='\033[38;2;238;238;238m'
SHADOW_MID='\033[38;2;96;96;96m'
SHADOW_DARK='\033[38;2;42;42;42m'
DIM='\033[38;2;140;140;140m'
WHITE='\033[38;2;238;238;238m'
GREEN='\033[38;2;80;220;100m'
RED='\033[38;2;220;60;60m'
YELLOW='\033[38;2;250;204;21m'

MENU_ITEMS=("Status" "Restart App" "Logs: App" "Open Brave" "Quit")
MENU_COUNT=5
MENU_START=12

mkdir -p "$LOG_DIR"

port_is_free() {
  ! lsof -ti:"$1" >/dev/null 2>&1
}

get_pid_on_port() {
  lsof -ti:"$1" 2>/dev/null | head -1
}

is_alive() {
  local pid="$1"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

health_dot() {
  if is_alive "$PID"; then
    printf "%b●%b" "$GREEN" "$NC"
  else
    printf "%b●%b" "$RED" "$NC"
  fi
}

start_app() {
  cd "$APP_DIR" || exit 1
  : >"$LOG_FILE"
  npm run dev -- --port "$PORT" >>"$LOG_FILE" 2>&1 &
  PID="$!"
  MODE="started"
  START_TIME="$(date +%s)"
  sleep 1
}

stop_app() {
  if is_alive "$PID"; then
    pkill -P "$PID" 2>/dev/null
    kill "$PID" 2>/dev/null
    wait "$PID" 2>/dev/null
  fi
}

adopt_or_start_app() {
  if port_is_free "$PORT"; then
    start_app
  else
    PID="$(get_pid_on_port "$PORT")"
    MODE="adopted"
    START_TIME="$(date +%s)"
  fi
}

restart_app() {
  if [[ "$MODE" == "adopted" ]]; then
    lsof -ti:"$PORT" | xargs kill 2>/dev/null
    sleep 1
  else
    stop_app
  fi
  start_app
}

cleanup() {
  trap - EXIT INT TERM HUP
  printf '\033[0m'
  printf '\033[?25h'
  printf '\033[?1049l'
  stty sane 2>/dev/null
  if [[ "$MODE" == "started" ]]; then
    stop_app
  fi
  printf '\nSession ended\n'
  exit 0
}

trap cleanup EXIT INT TERM HUP

draw_banner_text() {
  local row="$1"
  local col="$2"
  local color="$3"
  printf '\033[%d;%dH%b██████╗ ███████╗████████╗████████╗███████╗██████╗%b' "$row" "$col" "$color" "$NC"
  printf '\033[%d;%dH%b██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗%b' $((row + 1)) "$col" "$color" "$NC"
  printf '\033[%d;%dH%b██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝%b' $((row + 2)) "$col" "$color" "$NC"
  printf '\033[%d;%dH%b██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗%b' $((row + 3)) "$col" "$color" "$NC"
  printf '\033[%d;%dH%b██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║%b' $((row + 4)) "$col" "$color" "$NC"
  printf '\033[%d;%dH%b╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝%b' $((row + 5)) "$col" "$color" "$NC"
}

draw_banner() {
  draw_banner_text 4 6 "$SHADOW_DARK"
  draw_banner_text 3 5 "$SHADOW_MID"
  draw_banner_text 2 3 "$FG_BLOCK"
}

draw_menu_row() {
  local index="$1"
  local row=$((MENU_START + index))
  local marker=" "
  local style="$DIM"
  local dot=""

  if [[ "$index" -eq "$SELECTED" ]]; then
    marker=">"
    style="$WHITE"
  fi

  if [[ "$index" -eq 1 || "$index" -eq 2 ]]; then
    dot=" $(health_dot)"
  fi

  printf '\033[%d;1H\033[2K' "$row"
  printf "%b %s %-22s%b%b" "$style" "$marker" "${MENU_ITEMS[$index]}" "$NC" "$dot"
}

draw_dynamic() {
  local mode_label="$MODE"
  local mode_color="$YELLOW"
  if [[ "$MODE" == "started" ]]; then
    mode_color="$GREEN"
  fi

  printf '\033[9;1H%bURL:%b %s  %bMode:%b %b%s%b  %bPID:%b %s' "$DIM" "$NC" "$APP_URL" "$DIM" "$NC" "$mode_color" "$mode_label" "$NC" "$DIM" "$NC" "${PID:-none}"

  local i=0
  while [[ "$i" -lt "$MENU_COUNT" ]]; do
    draw_menu_row "$i"
    i=$((i + 1))
  done

  printf '\033[20;1H%b↑/↓ select  Enter run  q quit%b' "$DIM" "$NC"
}

draw_full() {
  printf '\033[?2026h'
  printf '\033[1;1H\033[J'
  draw_banner
  draw_dynamic
  printf '\033[?2026l'
}

draw_partial() {
  local old="$1"
  local new="$2"
  printf '\033[?2026h'
  draw_menu_row "$old"
  draw_menu_row "$new"
  printf '\033[?2026l'
}

view_status() {
  printf '\033[?2026h'
  printf '\033[1;1H\033[J'
  printf "%bStatus%b\n\n" "$WHITE" "$NC"
  printf "URL: %s\n" "$APP_URL"
  printf "Port: %s\n" "$PORT"
  printf "PID: %s\n" "${PID:-none}"
  printf "Mode: %s\n" "$MODE"
  printf "Log: %s\n" "$LOG_FILE"
  printf "\n%bPress Enter or b to go back. q quits.%b" "$DIM" "$NC"
  printf '\033[?2026l'

  while true; do
    IFS= read -rsn1 KEY
    if [[ "$KEY" == "" || "$KEY" == "b" ]]; then
      return
    elif [[ "$KEY" == "q" ]]; then
      exit 0
    fi
  done
}

view_logs() {
  while true; do
    printf '\033[?2026h'
    printf '\033[1;1H\033[J'
    printf "%bLogs: App%b\n\n" "$WHITE" "$NC"
    tail -30 "$LOG_FILE" 2>/dev/null
    printf "\n%bPress r refresh, Enter or b back, q quit.%b" "$DIM" "$NC"
    printf '\033[?2026l'

    IFS= read -rsn1 KEY
    if [[ "$KEY" == "" || "$KEY" == "b" ]]; then
      return
    elif [[ "$KEY" == "q" ]]; then
      exit 0
    fi
  done
}

open_brave() {
  open -a "Brave Browser" "$APP_URL" 2>/dev/null || open "$APP_URL"
}

execute_action() {
  case "$SELECTED" in
    0) view_status ;;
    1) restart_app ;;
    2) view_logs ;;
    3) open_brave ;;
    4) exit 0 ;;
  esac
}

printf '\033[?1049h'
printf '\033[?25l'
adopt_or_start_app
open_brave
draw_full

while true; do
  IFS= read -rsn1 KEY

  if [[ "$KEY" == $'\x1b' ]]; then
    IFS= read -rsn2 ARROW
    case "$ARROW" in
      "[A")
        OLD_SELECTED="$SELECTED"
        SELECTED=$(((SELECTED - 1 + MENU_COUNT) % MENU_COUNT))
        draw_partial "$OLD_SELECTED" "$SELECTED"
        ;;
      "[B")
        OLD_SELECTED="$SELECTED"
        SELECTED=$(((SELECTED + 1) % MENU_COUNT))
        draw_partial "$OLD_SELECTED" "$SELECTED"
        ;;
    esac
  elif [[ "$KEY" == "" ]]; then
    execute_action
    draw_full
  elif [[ "$KEY" == "q" ]]; then
    exit 0
  fi
done
