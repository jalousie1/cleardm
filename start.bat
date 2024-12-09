@echo off
title Discord Message Deleter Server

echo Verificando se o Node.js esta instalado...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js nao encontrado! Por favor, instale o Node.js de https://nodejs.org/
    pause
    exit
)

echo Verificando e instalando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
) else (
    echo Dependencias ja instaladas...
)

echo Iniciando o servidor...
start "" http://localhost:3000
node server.js

pause
